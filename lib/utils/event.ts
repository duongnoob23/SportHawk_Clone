import useEventFormStore from '@top/stores/eventFormStore';
import { useCallback } from 'react';

export const useEventDefaults = () => {
  const { formData } = useEventFormStore();

  const getStartsDefault = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    return tomorrow;
  }, []);

  const getMeetDefault = useCallback(() => {
    if (formData.startTime) {
      return new Date(formData.startTime);
    }
    return getStartsDefault();
  }, [formData.startTime, getStartsDefault]);

  const getAnswerByDefault = useCallback(() => {
    const baseDate = formData.startTime
      ? new Date(formData.startTime)
      : getStartsDefault();

    const answerDate = new Date(baseDate);
    answerDate.setDate(answerDate.getDate() - 3);
    answerDate.setHours(21, 0, 0, 0);

    const now = new Date();
    return answerDate > now ? answerDate : now;
  }, [formData.startTime, getStartsDefault]);

  const getEndsDefault = useCallback(() => {
    if (formData.startTime) {
      const startDate = new Date(formData.startTime);
      const startHour = startDate.getHours();

      if (startHour <= 21) {
        const endsDate = new Date(startDate);
        endsDate.setHours(startHour + 2);
        return endsDate;
      }
      return startDate;
    }

    const defaultStart = getStartsDefault();
    defaultStart.setHours(16, 0, 0, 0);
    return defaultStart;
  }, [formData.startTime, getStartsDefault]);

  const formatEventDate = (dateStr?: string) => {
    const date = new Date(dateStr!);
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const formatEventTime = (timeStr?: string) => {
    const [hours, minutes] = timeStr!.split(':');
    return `${hours}:${minutes}`;
  };

  return {
    getStartsDefault,
    getMeetDefault,
    getAnswerByDefault,
    getEndsDefault,
    formatEventTime,
    formatEventDate,
  };
};
