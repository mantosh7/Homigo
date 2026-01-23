import api from "./api" ;

export const getAnalyticsSummary = async () => {
    const res = await api.get("/analytics/summary") ;
    return res.data ;
}

export const getMonthlyTrend = async () =>{
    const res = await api.get("/analytics/monthly-trend") ;
    return res.data ;
}

