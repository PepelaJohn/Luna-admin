import { subsApi, SubUser } from "@/lib/api";
import { useEffect, useState } from "react";

export const useSubscribers = ()=>{

    

const [loading, setLoading] = useState(false);



const [total, setTotal] = useState(0);
const [subscribers, setSubscribers] = useState<SubUser[]>([]);

const [error, setError] = useState('');
const getSubs = async ()=>{
    setLoading(true)
    try {
        const response = await subsApi.getSubs()
        if(response.success){
            setSubscribers(response.subscribers)
            setTotal(response.pagination.total)
        }
    } catch (error:any) {
        setError(error.message)
    }finally{
        setLoading(false)
    }
}
useEffect(()=>{
    getSubs()
},[])
    return {
        loading,
        subscribers,
        error,
       totalSubs: total
    }
}