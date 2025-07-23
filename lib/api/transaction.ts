import api from "./axios"; // or use fetch if you prefer


export async function getTransactions(params: { page: number; limit: number; status: string }) {
  const query = new URLSearchParams(params as any).toString();
  const res = await api.get(`/transactions?${query}`);
  return res.data;
}

export async function getSingleTransaction(id:string){
    const res = await api.get(`/transactions/${id}`);
    return res.data;
}