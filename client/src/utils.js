module.exports = {
    formatDate: (str) => {
        const date = new Date(str);
        return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('.')
    },
    formatTime: (str) => {
        const date = new Date(str);
        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
    }
}