import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { StudyPlanSessionType, StudyPlanTopicType } from '@prisma/client';
import { PrismaService } from 'src/common/services/database.service';
import { QuizService } from '../quiz/quiz.service';
import { CreateStudyDto, UpdateStudyDto } from './dto/study.dto';

const DAY = 24 * 60 * 60 * 1000;
const THEMATIC_QUESTIONS = 25;
const TERRITORIAL_QUESTIONS = 5;

@Injectable()
export class StudyService {
  private readonly logger = new Logger(StudyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly quizService: QuizService,
  ) {}

  async findConfiguration() {
    this.logger.log('Consultando configuración de estudios');
    const rows = await this.prisma.pdf.findMany({
      distinct: ['community', 'city', 'type'],
      select: { community: true, city: true, type: true },
      orderBy: [{ community: 'asc' }, { city: 'asc' }, { type: 'asc' }],
    });

    this.logger.log(`Configuraciones encontradas: ${rows.length}`);

    const result = Object.create(null);

    for (const row of rows) {
      this.logger.log(
        `Configuración: community=${row.community}, city=${row.city}, type=${row.type}`,
      );
      result[row.community] ??= {};
      result[row.community][row.city] ??= [];
      result[row.community][row.city].push(row.type);
    }

    return result;
  }

  async findAll(userId) {
    this.logger.log(`Consultando sesiones del usuario=${userId}`);

    const sessions = await this.prisma.studyPlanSession.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        studyPlanId: true,
        studyPlanTopicIds: true,
        date: true,
        type: true,
        percentage: true,
      },
    });

    const studyPlanIds = [
      ...new Set(sessions.map((session) => session.studyPlanId)),
    ];
    const territorialTopics = await this.prisma.studyPlanTopic.findMany({
      where: {
        studyPlanId: { in: studyPlanIds },
        type: StudyPlanTopicType.TERRITORIAL,
      },
      select: { id: true, studyPlanId: true },
    });
    const territorialByPlan = new Map();

    for (const topic of territorialTopics) {
      territorialByPlan.set(topic.studyPlanId, [
        ...(territorialByPlan.get(topic.studyPlanId) ?? []),
        topic.id,
      ]);
    }

    const sessionsWithThematicTopics = sessions.map((session) => ({
      ...session,
      studyPlanTopicIds: session.studyPlanTopicIds.filter(
        (studyPlanTopicId) =>
          !(territorialByPlan.get(session.studyPlanId) ?? []).includes(
            studyPlanTopicId,
          ),
      ),
    }));

    const planTopics = await this.prisma.studyPlanTopic.findMany({
      where: {
        studyPlanId: { in: studyPlanIds },
        type: { not: StudyPlanTopicType.TERRITORIAL },
      },
      select: { studyPlanId: true, id: true, topicName: true },
    });
    const topicNamesByPlan = new Map();

    for (const topic of planTopics) {
      const namesByTopic = topicNamesByPlan.get(topic.studyPlanId) ?? new Map();
      namesByTopic.set(topic.id, topic.topicName);
      topicNamesByPlan.set(topic.studyPlanId, namesByTopic);
    }

    const today = this.day(new Date());

    return sessionsWithThematicTopics.map(
      ({ studyPlanId, studyPlanTopicIds, ...session }) => ({
        ...session,
        topics: studyPlanTopicIds
          .map((studyPlanTopicId) =>
            topicNamesByPlan.get(studyPlanId)?.get(studyPlanTopicId),
          )
          .filter(Boolean),
        status:
          session.percentage !== null
            ? 'REALIZADA'
            : session.date < today
              ? 'NO_REALIZADA'
              : 'PENDIENTE',
      }),
    );
  }

  async findQuizzes(userId, id) {
    const sessionId = Number(id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      throw new HttpException('Id de sesión no válido', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(
      `Consultando quizzes: usuario=${userId}, sesión=${sessionId}`,
    );

    const session = await this.prisma.studyPlanSession.findFirst({
      where: { id: sessionId, userId },
      select: {
        id: true,
        studyPlanTopicIds: true,
        date: true,
        type: true,
        percentage: true,
        quizzes: {
          orderBy: { id: 'asc' },
          select: {
            id: true,
            quizId: true,
            optionSelected: true,
            quiz: {
              select: {
                id: true,
                title: true,
                option1: true,
                option2: true,
                option3: true,
                option4: true,
                result: true,
                topicId: true,
                justification: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new HttpException(
        'Sesión de estudio no encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    this.logger.log(
      `Quizzes encontrados: sesión=${sessionId}, total=${session.quizzes.length}`,
    );

    return session.quizzes.map((studyPlanQuiz) => ({
      id: studyPlanQuiz.quiz.id,
      optionSelected: studyPlanQuiz.optionSelected,
      // La respuesta correcta solo se envía para sesiones ya realizadas.
      // Así la sesión de hoy no expone las respuestas del examen.
      ...(session.percentage !== null
        ? { result: studyPlanQuiz.quiz.result }
        : {}),
      title: studyPlanQuiz.quiz.title,
      option1: studyPlanQuiz.quiz.option1,
      option2: studyPlanQuiz.quiz.option2,
      option3: studyPlanQuiz.quiz.option3,
      option4: studyPlanQuiz.quiz.option4,
      topicId: studyPlanQuiz.quiz.topicId,
      justification: studyPlanQuiz.quiz.justification,
    }));
  }

  async create(userId, dto: CreateStudyDto) {
    this.logger.log(
      `Creando plan: usuario=${userId}, community=${dto.community}, ` +
        `city=${dto.city}, type=${dto.type}, ` +
        `estimateExamDate=${dto.estimateExamDate}`,
    );

    const examDateValue = new Date(dto.estimateExamDate);

    if (
      !Number.isFinite(dto.estimateExamDate) ||
      Number.isNaN(examDateValue.getTime())
    ) {
      throw new HttpException(
        'estimateExamDate no es válida',
        HttpStatus.BAD_REQUEST,
      );
    }

    const examDate = this.day(examDateValue);
    const today = this.day(new Date());
    const lastDay = examDate;

    this.logger.log(
      `Fechas del plan: inicio=${today.toISOString()}, ` +
        `examen=${examDate.toISOString()}, último día=${lastDay.toISOString()}`,
    );

    if (lastDay <= today) {
      throw new HttpException(
        'La fecha estimada del examen debe ser posterior a hoy',
        HttpStatus.BAD_REQUEST,
      );
    }

    const [user, studyPlan] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, studyPlanId: true },
      }),
      this.prisma.studyPlan.findFirst({
        where: {
          community: dto.community,
          city: dto.city,
          type: dto.type,
        },
        include: {
          studyPlanTopics: {
            select: { id: true, topicId: true, topicName: true, type: true },
            orderBy: { id: 'asc' },
          },
        },
      }),
    ]);

    this.logger.log(
      `Resultado de búsqueda: usuario=${user ? 'encontrado' : 'no encontrado'}, ` +
        `studyPlan=${studyPlan ? studyPlan.id : 'no encontrado'}`,
    );

    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    if (user.studyPlanId) {
      throw new HttpException(
        'El usuario ya tiene un plan de estudio. Debe eliminarlo antes de crear otro',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!studyPlan) {
      throw new HttpException(
        'Plan de estudio no encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    this.logger.log(`StudyPlan encontrado: id=${studyPlan.id}`);

    const topics = {
      specific: studyPlan.studyPlanTopics
        .filter(({ type }) => type === StudyPlanTopicType.ESPECIFICO)
        .map(({ id }) => id),
      legislation: studyPlan.studyPlanTopics
        .filter(({ type }) => type === StudyPlanTopicType.LEGISLACION)
        .map(({ id }) => id),
      territorial: studyPlan.studyPlanTopics
        .filter(({ type }) => type === StudyPlanTopicType.TERRITORIAL)
        .map(({ id }) => id),
    };

    if (!topics.specific.length && !topics.legislation.length) {
      throw new HttpException(
        'El plan no tiene temas específicos ni de legislación',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!topics.territorial.length) {
      throw new HttpException(
        'El plan no tiene temas territoriales',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(
      `Temas del plan: específicos=${topics.specific.length}, ` +
        `legislación=${topics.legislation.length}, ` +
        `territoriales=${topics.territorial.length}`,
    );

    const sequence = this.createSequence(topics.specific, topics.legislation);
    const pools = await this.createQuizPools(
      studyPlan.studyPlanTopics,
      sequence,
      topics.territorial,
    );
    const sessions = this.createSessions(today, lastDay, sequence);

    this.logger.log(
      `Plan calculado: secuencia=${sequence.length}, sesiones=${sessions.length}, ` +
        `preguntas temáticas disponibles=${pools.thematic.length}, ` +
        `territoriales disponibles=${pools.territorial.length}`,
    );
    this.logger.log(`Secuencia temática: ${sequence.join(' -> ')}`);

    const created = await this.prisma.$transaction(
      async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            studyPlanId: studyPlan.id,
            examEstimatedDate: examDate,
          },
        });

        return this.createPlanSessions(
          tx,
          userId,
          studyPlan.id,
          sessions,
          pools,
        );
      },
      {
        maxWait: 10000,
        timeout: 120000,
      },
    );

    this.logger.log(
      `Plan creado: usuario=${userId}, studyPlan=${studyPlan.id}, ` +
        `sesiones=${created.sessionsCreated}, quizzes=${created.quizzesCreated}`,
    );
  }

  async update(userId, dto: UpdateStudyDto) {
    this.logger.log(
      `Actualizando plan: usuario=${userId}, ` +
        `estimateExamDate=${dto.estimateExamDate}`,
    );

    const examDateValue = new Date(dto.estimateExamDate);

    if (
      !Number.isFinite(dto.estimateExamDate) ||
      Number.isNaN(examDateValue.getTime())
    ) {
      throw new HttpException(
        'estimateExamDate no es válida',
        HttpStatus.BAD_REQUEST,
      );
    }

    const examDate = this.day(examDateValue);
    const today = this.day(new Date());

    if (examDate <= today) {
      throw new HttpException(
        'La fecha estimada del examen debe ser posterior a hoy',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, studyPlanId: true },
    });

    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    if (!user.studyPlanId) {
      throw new HttpException(
        'El usuario no tiene un plan de estudio',
        HttpStatus.NOT_FOUND,
      );
    }

    const studyPlan = await this.prisma.studyPlan.findUnique({
      where: { id: user.studyPlanId },
      include: {
        studyPlanTopics: {
          select: { id: true, topicId: true, topicName: true, type: true },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!studyPlan) {
      throw new HttpException(
        'Plan de estudio no encontrado',
        HttpStatus.NOT_FOUND,
      );
    }

    const topics = {
      specific: studyPlan.studyPlanTopics
        .filter(({ type }) => type === StudyPlanTopicType.ESPECIFICO)
        .map(({ id }) => id),
      legislation: studyPlan.studyPlanTopics
        .filter(({ type }) => type === StudyPlanTopicType.LEGISLACION)
        .map(({ id }) => id),
      territorial: studyPlan.studyPlanTopics
        .filter(({ type }) => type === StudyPlanTopicType.TERRITORIAL)
        .map(({ id }) => id),
    };

    if (!topics.specific.length && !topics.legislation.length) {
      throw new HttpException(
        'El plan no tiene temas específicos ni de legislación',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!topics.territorial.length) {
      throw new HttpException(
        'El plan no tiene temas territoriales',
        HttpStatus.BAD_REQUEST,
      );
    }

    const preservedSessions = await this.prisma.studyPlanSession.findMany({
      where: {
        userId,
        studyPlanId: user.studyPlanId,
        date: { lte: today },
      },
      orderBy: { date: 'asc' },
      select: { date: true, type: true, studyPlanTopicIds: true },
    });

    const sequence = this.createSequence(topics.specific, topics.legislation);
    const normalTopicsCount = preservedSessions
      .filter(({ type }) => type === StudyPlanSessionType.NORMAL)
      .reduce((total, session) => total + session.studyPlanTopicIds.length, 0);
    const sequenceIndex = normalTopicsCount % sequence.length;
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const sprintParts = Math.min(3, sequence.length);
    const sprintSessions = preservedSessions.filter(
      ({ type }) => type === StudyPlanSessionType.SPRINT,
    );
    const initialSprintIndex =
      examDate.getTime() - tomorrow.getTime() < 14 * DAY
        ? sprintSessions.length % sprintParts
        : 0;
    const initialSprintChunks = initialSprintIndex
      ? this.createRemainingSprintChunks(
          sequence,
          sprintSessions.slice(-initialSprintIndex),
          sprintParts,
        )
      : [];
    const monday = new Date(today);
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    const weekTopics = this.unique(
      preservedSessions
        .filter(
          ({ date, type }) =>
            date >= monday && type !== StudyPlanSessionType.SIMULACRO,
        )
        .flatMap(({ studyPlanTopicIds }) => studyPlanTopicIds),
    );
    const sessions = this.createSessions(
      tomorrow,
      examDate,
      sequence,
      sequenceIndex,
      weekTopics,
      initialSprintIndex,
      initialSprintChunks,
    );

    const pools = sessions.length
      ? await this.createQuizPools(
          studyPlan.studyPlanTopics,
          sequence,
          topics.territorial,
        )
      : null;

    this.logger.log(
      `Plan recalculado: usuario=${userId}, studyPlan=${studyPlan.id}, ` +
        `sesiones conservadas=${preservedSessions.length}, ` +
        `sesiones futuras nuevas=${sessions.length}, ` +
        `índice de secuencia=${sequenceIndex}, ` +
        `examen=${examDate.toISOString()}`,
    );

    const updated = await this.prisma.$transaction(
      async (tx) => {
        const deleted = await tx.studyPlanSession.deleteMany({
          where: {
            userId,
            studyPlanId: studyPlan.id,
            date: { gt: today },
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: { examEstimatedDate: examDate },
        });

        const created = await this.createPlanSessions(
          tx,
          userId,
          studyPlan.id,
          sessions,
          pools,
        );

        return {
          deletedSessions: deleted.count,
          ...created,
        };
      },
      {
        maxWait: 10000,
        timeout: 120000,
      },
    );

    this.logger.log(
      `Plan actualizado: usuario=${userId}, ` +
        `sesiones eliminadas=${updated.deletedSessions}, ` +
        `sesiones creadas=${updated.sessionsCreated}, ` +
        `quizzes creados=${updated.quizzesCreated}`,
    );
  }

  private async createPlanSessions(tx, userId, studyPlanId, sessions, pools) {
    let sessionsCreated = 0;
    let quizzesCreated = 0;

    for (const session of sessions) {
      this.logger.log(
        `Procesando sesión: fecha=${session.date.toISOString()}, ` +
          `tipo=${session.type}, studyPlanTopics=${session.studyPlanTopicIds.join(',') || 'ninguno'}`,
      );

      const existing = await tx.studyPlanSession.findUnique({
        where: {
          userId_studyPlanId_date: {
            userId,
            studyPlanId,
            date: session.date,
          },
        },
        select: { id: true },
      });

      if (existing) {
        this.logger.log(`Sesión ya existente: id=${existing.id}`);
        continue;
      }

      const quizIds = this.selectQuizIds(session, pools);
      this.logger.log(
        `Preguntas seleccionadas: sesión=${session.date.toISOString()}, ` +
          `total=${quizIds.length}, ids=${quizIds.join(',')}`,
      );

      await tx.studyPlanSession.create({
        data: {
          studyPlanId,
          userId,
          studyPlanTopicIds: session.studyPlanTopicIds,
          date: session.date,
          type: session.type,
          quizzes: { create: quizIds.map((quizId) => ({ quizId })) },
        },
      });

      sessionsCreated += 1;
      quizzesCreated += quizIds.length;
      this.logger.log(
        `Sesión creada: fecha=${session.date.toISOString()}, ` +
          `sesiones=${sessionsCreated}, quizzes=${quizzesCreated}`,
      );
    }

    return { sessionsCreated, quizzesCreated };
  }

  async delete(userId) {
    this.logger.log(`Eliminando plan de estudio del usuario=${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, studyPlanId: true },
    });

    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    if (!user.studyPlanId) {
      throw new HttpException(
        'El usuario no tiene un plan de estudio',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const deleted = await tx.studyPlanSession.deleteMany({
        where: {
          userId,
          studyPlanId: user.studyPlanId,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          studyPlanId: null,
          examEstimatedDate: null,
        },
      });

      this.logger.log(
        `Sesiones eliminadas: usuario=${userId}, ` +
          `studyPlan=${user.studyPlanId}, total=${deleted.count}`,
      );
    });

    this.logger.log(`Plan de estudio eliminado del usuario=${userId}`);
  }

  private day(date) {
    const result = new Date(date);
    return new Date(
      Date.UTC(result.getFullYear(), result.getMonth(), result.getDate()),
    );
  }

  private createSequence(specific, legislation) {
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(specific.length, legislation.length);
    const specificPerRound = Math.max(1, specific.length / divisor);
    const legislationPerRound = Math.max(1, legislation.length / divisor);
    const sequence = [];
    let specificIndex = 0;
    let legislationIndex = 0;

    while (
      specificIndex < specific.length ||
      legislationIndex < legislation.length
    ) {
      for (let i = 0; i < specificPerRound; i += 1) {
        if (specificIndex < specific.length) {
          sequence.push(specific[specificIndex++]);
        }
      }

      for (let i = 0; i < legislationPerRound; i += 1) {
        if (legislationIndex < legislation.length) {
          sequence.push(legislation[legislationIndex++]);
        }
      }
    }

    this.logger.log(
      `Secuencia creada: específicos=${specific.length}, ` +
        `legislación=${legislation.length}, ` +
        `ratio=${specificPerRound}:${legislationPerRound}, ` +
        `secuencia=${sequence.join(' -> ')}`,
    );

    return sequence;
  }

  private createSessions(
    today,
    lastDay,
    sequence,
    initialSequenceIndex = 0,
    initialWeekTopics = [],
    initialSprintIndex = 0,
    initialSprintChunks = [],
  ) {
    const sessions = [];
    let sequenceIndex = initialSequenceIndex;
    let weekTopics = this.unique(initialWeekTopics);
    const sprintParts = Math.min(3, sequence.length);
    let sprintChunks = initialSprintChunks;
    let sprintIndex = initialSprintIndex % sprintParts;

    for (
      const date = new Date(today);
      date <= lastDay;
      date.setUTCDate(date.getUTCDate() + 1)
    ) {
      const weekday = date.getUTCDay();
      if (weekday === 0) {
        this.logger.log(`Fecha ${date.toISOString()}: domingo, sin sesión`);
        continue;
      }
      if (weekday === 1) {
        weekTopics = [];
        this.logger.log(`Fecha ${date.toISOString()}: comienza nueva semana`);
      }

      if (weekday === 6) {
        const simulationTopics = this.unique(weekTopics);
        this.logger.log(
          `Fecha ${date.toISOString()}: simulacro con topics=${simulationTopics.join(',') || 'ninguno'}`,
        );
        sessions.push({
          date: new Date(date),
          type: StudyPlanSessionType.SIMULACRO,
          studyPlanTopicIds: simulationTopics,
        });
        continue;
      }

      const daysRemaining = Math.ceil(
        (lastDay.getTime() - date.getTime()) / DAY,
      );
      const count = this.topicsPerDay(daysRemaining);
      const isSprint = !count;
      let studyPlanTopicIds;

      if (isSprint) {
        if (!sprintChunks.length || sprintIndex === 0) {
          sprintChunks = this.createSprintChunks(sequence);
        }
        studyPlanTopicIds = sprintChunks[sprintIndex];
      } else {
        studyPlanTopicIds = this.take(sequence, sequenceIndex, count);
      }

      if (count) {
        sequenceIndex =
          (sequenceIndex + Math.min(count, sequence.length)) % sequence.length;
      } else {
        this.logger.log(
          `Fecha ${date.toISOString()}: sprint ${sprintIndex + 1}/${sprintParts}, ` +
            `asignados=${studyPlanTopicIds.join(',')}`,
        );
        sprintIndex = (sprintIndex + 1) % sprintParts;
      }

      weekTopics.push(...studyPlanTopicIds);
      this.logger.log(
        `Fecha ${date.toISOString()}: días restantes=${daysRemaining}, ` +
          `studyPlanTopics=${count || studyPlanTopicIds.length}, ` +
          `tipo=${count ? 'NORMAL' : 'SPRINT'}, ` +
          `asignados=${studyPlanTopicIds.join(',')}`,
      );
      sessions.push({
        date: new Date(date),
        type: count ? StudyPlanSessionType.NORMAL : StudyPlanSessionType.SPRINT,
        studyPlanTopicIds,
      });
    }

    return sessions;
  }

  private createSprintChunks(sequence) {
    const chunks = this.splitSequence(this.shuffle(sequence), 3);

    this.logger.log(
      `Sprint dividido en ${chunks.length} sesiones: ` +
        `${chunks.map((chunk) => chunk.join(',')).join(' | ')}`,
    );

    return chunks;
  }

  private createRemainingSprintChunks(sequence, completedSessions, parts) {
    const completedChunks = completedSessions.map(({ studyPlanTopicIds }) =>
      this.unique(studyPlanTopicIds),
    );
    const completedTopicIds = new Set(completedChunks.flat());
    const remainingTopics = this.shuffle(
      sequence.filter((topicId) => !completedTopicIds.has(topicId)),
    );
    const sizes = this.getSprintChunkSizes(sequence.length, parts);
    const chunks = [...completedChunks];
    let start = 0;

    for (const size of sizes.slice(completedChunks.length)) {
      chunks.push(remainingTopics.slice(start, start + size));
      start += size;
    }

    this.logger.log(
      `Sprint conservado y completado: ` +
        `${chunks.map((chunk) => chunk.join(',')).join(' | ')}`,
    );

    return chunks;
  }

  private splitSequence(sequence, parts) {
    const sizes = this.getSprintChunkSizes(sequence.length, parts);
    const chunks = [];
    let start = 0;

    for (const size of sizes) {
      chunks.push(sequence.slice(start, start + size));
      start += size;
    }

    return chunks;
  }

  private getSprintChunkSizes(sequenceLength, parts) {
    const totalParts = Math.min(parts, sequenceLength);
    const baseSize = Math.floor(sequenceLength / totalParts);
    const extraItems = sequenceLength % totalParts;

    return Array.from(
      { length: totalParts },
      (_, index) => baseSize + (index < extraItems ? 1 : 0),
    );
  }

  private shuffle(values) {
    const shuffled = [...values];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[index],
      ];
    }

    return shuffled;
  }

  private topicsPerDay(daysRemaining) {
    if (daysRemaining < 14) return 0;
    if (daysRemaining > 180) return 1;
    if (daysRemaining >= 120) return 2;
    if (daysRemaining >= 98) return 3;
    if (daysRemaining >= 63) return 4;
    return 5;
  }

  private take(sequence, start, count) {
    return this.unique(
      Array.from(
        { length: Math.min(count, sequence.length) },
        (_, index) => sequence[(start + index) % sequence.length],
      ),
    );
  }

  private async createQuizPools(
    studyPlanTopics,
    thematicStudyPlanTopicIds,
    territorialStudyPlanTopicIds,
  ) {
    const topicIdsByStudyPlanTopic = (studyPlanTopicId) =>
      studyPlanTopics.find(({ id }) => id === studyPlanTopicId)?.topicId ?? [];
    const studyPlanTopicIds = this.unique([
      ...thematicStudyPlanTopicIds,
      ...territorialStudyPlanTopicIds,
    ]);
    const rootIds = this.unique(
      studyPlanTopicIds.flatMap((studyPlanTopicId) =>
        topicIdsByStudyPlanTopic(studyPlanTopicId),
      ),
    );
    this.logger.log(
      `Creando pools de preguntas para studyPlanTopics=${studyPlanTopicIds.join(',')}, ` +
        `roots=${rootIds.join(',')}`,
    );
    const descendants = new Map();
    const allDescendantIds = new Set();

    for (const root of rootIds) {
      const ids = new Set(await this.quizService.getAllChildren([root]));

      descendants.set(root, ids);
      ids.forEach((id) => allDescendantIds.add(id));
      this.logger.log(
        `Root ${root}: descendientes encontrados=${ids.size}, ids=${[...ids].join(',')}`,
      );
    }

    const quizzes = await this.prisma.quiz.findMany({
      where: { topicId: { in: [...allDescendantIds].map(Number) } },
      select: { id: true, topicId: true },
    });
    this.logger.log(`Quizzes encontrados para los pools: ${quizzes.length}`);
    const byRoot = new Map();

    for (const root of rootIds) {
      const ids = descendants.get(root) ?? new Set();
      byRoot.set(
        root,
        this.unique(
          quizzes
            .filter((quiz) => quiz.topicId !== null && ids.has(quiz.topicId))
            .map((quiz) => quiz.id),
        ),
      );
      this.logger.log(`Pool root=${root}: quizzes=${byRoot.get(root).length}`);
    }

    const byStudyPlanTopic = new Map();

    for (const studyPlanTopicId of studyPlanTopicIds) {
      const topicIds = topicIdsByStudyPlanTopic(studyPlanTopicId);
      const quizIds = this.unique(
        topicIds.flatMap((root) => byRoot.get(root) ?? []),
      );
      byStudyPlanTopic.set(studyPlanTopicId, quizIds);
      this.logger.log(
        `Pool studyPlanTopic=${studyPlanTopicId}: ` +
          `topicIds=${topicIds.join(',')}, quizzes=${quizIds.length}`,
      );
    }

    const pools = {
      byStudyPlanTopic,
      thematicStudyPlanTopicIds: this.unique(thematicStudyPlanTopicIds),
      thematic: this.unique(
        thematicStudyPlanTopicIds.flatMap(
          (studyPlanTopicId) => byStudyPlanTopic.get(studyPlanTopicId) ?? [],
        ),
      ),
      territorial: this.unique(
        territorialStudyPlanTopicIds.flatMap(
          (studyPlanTopicId) => byStudyPlanTopic.get(studyPlanTopicId) ?? [],
        ),
      ),
    };

    this.logger.log(
      `Pools creados: temáticos=${pools.thematic.length}, ` +
        `territoriales=${pools.territorial.length}`,
    );

    return pools;
  }

  private selectQuizIds(session, pools) {
    const studyPlanTopicIds =
      session.type === StudyPlanSessionType.SIMULACRO &&
      !session.studyPlanTopicIds.length
        ? pools.thematicStudyPlanTopicIds
        : session.studyPlanTopicIds;

    const thematicPool = studyPlanTopicIds.flatMap(
      (studyPlanTopicId) => pools.byStudyPlanTopic.get(studyPlanTopicId) ?? [],
    );
    this.logger.log(
      `Seleccionando preguntas: fecha=${session.date.toISOString()}, ` +
        `tipo=${session.type}, studyPlanTopics=${studyPlanTopicIds.join(',') || 'todos'}, ` +
        `poolTemático=${thematicPool.length}`,
    );
    const selected = new Set(
      this.sample(
        thematicPool.length ? thematicPool : pools.thematic,
        THEMATIC_QUESTIONS,
        new Set(),
      ),
    );

    if (selected.size < THEMATIC_QUESTIONS) {
      throw new HttpException(
        'No hay suficientes preguntas temáticas para generar el plan',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.sample(pools.territorial, TERRITORIAL_QUESTIONS, selected).forEach(
      (id) => selected.add(id),
    );

    this.logger.log(
      `Preguntas seleccionadas antes de validar: temáticas=${THEMATIC_QUESTIONS}, ` +
        `total=${selected.size}, poolTerritorial=${pools.territorial.length}`,
    );

    if (selected.size < THEMATIC_QUESTIONS + TERRITORIAL_QUESTIONS) {
      throw new HttpException(
        'No hay suficientes preguntas territoriales para generar el plan',
        HttpStatus.BAD_REQUEST,
      );
    }

    return [...selected].map(Number);
  }

  private sample(values, count, excluded) {
    const available = values.filter((value) => !excluded.has(value));

    for (let i = available.length - 1; i > 0; i -= 1) {
      const random = Math.floor(Math.random() * (i + 1));
      [available[i], available[random]] = [available[random], available[i]];
    }

    return available.slice(0, count).map(Number);
  }

  private unique(values) {
    return [...new Set(values)].map(Number);
  }
}
