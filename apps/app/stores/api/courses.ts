import { defineStore } from "pinia";

type CourseParams = {
  TimeTrack?: number;
  CurrentLessonId?: string;
  ContentId?: string;
  Done?: boolean;
  Lessons?: string[];
  Id?: string;
};

export const useCoursesStore = defineStore("courses", {
  state: (): {
    course: CourseParams | null;
    courses: CourseParams[] | null;
  } => ({
    course: null,
    courses: null,
  }),
  getters: {
    isEnrolled(state): boolean {
      return !!state.course?.ContentId;
    },
  },
  actions: {
    async getCourse(id: string) {
      try {
        const response = await this.$api(`/course/${id}`);
        this.course = response[0] || null;
      } catch (e) {
        throw new Error((e as Error).message);
      }
    },
    async getCourses() {
      try {
        const response = await this.$api(`/course`);
        this.courses = response;
        return response;
      } catch (e) {
        throw new Error((e as Error).message);
      }
    },
    async createCourse(payload: CourseParams) {
      try {
        this.course = payload;
        await this.$api(`/course`, {
          method: "POST",
          body: payload,
        });
      } catch (e) {
        this.course = null;
        throw new Error((e as Error).message);
      }
    },
    async updateCourse(payload: CourseParams) {
      if (!this.course) return;

      const lastState = Object.freeze({ ...this.course });
      this.course = { ...this.course, ...payload };
      try {
        await this.$api(`/course/${this.course.Id}`, {
          method: "PATCH",
          body: payload,
        });
      } catch (e) {
        this.course = lastState;
        throw new Error((e as Error).message);
      }
    },
    async updateCourseLessons(lessonId: string) {
      const lessons = new Set(this.course?.Lessons);
      lessons.add(lessonId);
      try {
        if (this.course) {
          this.course.Lessons = [...lessons];
        }

        await this.$api(`/course/${this.course?.Id}`, {
          method: "PATCH",
          body: {
            lessons: [...lessons],
          },
        });
      } catch (e) {
        lessons.delete(lessonId);
        if (this.course) {
          this.course.Lessons = [...lessons];
        }
        throw new Error((e as Error).message);
      }
    },
  },
});