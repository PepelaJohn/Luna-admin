import {  partnersApi } from "@/lib/api";
import { FetchedStatsType } from "@/types/api";
import { useEffect, useState } from "react";



export const usePartnerStats = ()=>{

    

const [loading, setLoading] = useState(false);




// const [, setSubscribers] = useState<SubUser[]>([]);
const [stats, setStats] = useState<FetchedStatsType>()

const [error, setError] = useState('');
const getPartners = async ()=>{
    setLoading(true)
    try {
        const response = await partnersApi.getPartnerStats()
        if(response.success){
        setStats(response.stats)
        }
    } catch (error:any) {
        setError(error.message)
    }finally{
        setLoading(false)
    }
}
useEffect(()=>{
    getPartners()
},[])
    return {
        loading,
        stats,
        error,
  
    }
}