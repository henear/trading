import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const getQuote = (symbol) => api.get(`/stocks/quote?symbol=${symbol}`)
export const getNews = (symbol) => api.get(`/stocks/news?symbol=${symbol}`)
export const getAnalysis = (symbol) => api.get(`/analysis?symbol=${symbol}`)
