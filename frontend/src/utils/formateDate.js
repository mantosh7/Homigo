import dayjs from 'dayjs'
export const fmt = (d) => d ? dayjs(d).format('MMM D, YYYY') : ''