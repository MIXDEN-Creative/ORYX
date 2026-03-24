"use client";

import { useEffect } from "react";

export default function TicketTypeBuilder({
  isFree,
  eventCapacity,
  earlyBirdEnabled,
  vipEnabled,
  vipPlusEnabled,
  ticketTypes,
  setTicketTypes
}: any) {

  function update(index: number, field: string, value: any) {

    const copy = [...ticketTypes];

    copy[index] = {
      ...copy[index],
      [field]: value
    };

    setTicketTypes(copy);
  }

  function addTicket() {

    setTicketTypes([
      ...ticketTypes,
      {
        name: "",
        price: "",
        quantity: "",
        description: ""
      }
    ]);
  }

  function removeTicket(index:number){

    const copy = [...ticketTypes];
    copy.splice(index,1);
    setTicketTypes(copy);

  }

  const totalAssigned =
    ticketTypes.reduce(
      (sum:any,t:any)=>sum+Number(t.quantity||0),0
    );

  const remaining =
    Number(eventCapacity||0) - totalAssigned;

  useEffect(()=>{

    const presets = [];

    presets.push({
      name:"General Admission",
      price:isFree ? "0":"",
      quantity:"",
      description:""
    });

    if(earlyBirdEnabled){
      presets.push({
        name:"Early Bird",
        price:isFree ? "0":"",
        quantity:"",
        description:""
      });
    }

    if(vipEnabled){
      presets.push({
        name:"VIP",
        price:"",
        quantity:"",
        description:""
      });
    }

    if(vipPlusEnabled){
      presets.push({
        name:"VIP+",
        price:"",
        quantity:"",
        description:""
      });
    }

    setTicketTypes(presets)

  },[earlyBirdEnabled,vipEnabled,vipPlusEnabled,isFree]);

  return (

<div className="rounded-xl border border-purple-500/40 p-6">

<h3 className="text-lg font-semibold mb-3">
Ticket Types
</h3>

<p className="text-sm text-zinc-400 mb-5">
Create ticket tiers, set prices, quantities, and descriptions.
</p>

<div className="mb-4 p-4 rounded-lg bg-black border border-purple-500/30">

<div className="flex justify-between text-sm">

<span>Total Assigned</span>
<span>{totalAssigned}</span>

</div>

<div className="flex justify-between text-sm">

<span>Capacity</span>
<span>{eventCapacity || 0}</span>

</div>

<div className="flex justify-between text-sm">

<span>Remaining</span>
<span className={remaining<0?"text-red-400":"text-green-400"}>
{remaining}
</span>

</div>

</div>

<div className="space-y-4">

{ticketTypes.map((ticket:any,index:number)=>{

const locked =
isFree &&
(ticket.name==="General Admission" ||
ticket.name==="Early Bird")

return(

<div
key={index}
className="p-4 rounded-xl border border-purple-500/40"
>

<div className="grid grid-cols-3 gap-3">

<input
value={ticket.name}
onChange={(e)=>update(index,"name",e.target.value)}
placeholder="Ticket Name"
className="h-12 rounded-lg bg-black border border-purple-500/40 px-3"
/>

<div className="relative">

<span className="absolute left-3 top-3 text-zinc-400">$</span>

<input
type="number"
value={locked?"0":ticket.price}
disabled={locked}
onChange={(e)=>update(index,"price",e.target.value)}
className="pl-7 h-12 w-full rounded-lg bg-black border border-purple-500/40"
/>

</div>

<input
type="number"
value={ticket.quantity}
onChange={(e)=>update(index,"quantity",e.target.value)}
placeholder="Quantity"
className="h-12 rounded-lg bg-black border border-purple-500/40 px-3"
/>

</div>

<textarea
value={ticket.description}
onChange={(e)=>update(index,"description",e.target.value)}
placeholder="Ticket description (optional)"
className="mt-3 w-full rounded-lg bg-black border border-purple-500/40 p-3"
/>

{ticketTypes.length>1 && (

<button
onClick={()=>removeTicket(index)}
className="mt-2 text-red-400 text-sm"
>
Remove Ticket
</button>

)}

</div>

)

})}

</div>

<button
onClick={addTicket}
className="mt-5 bg-purple-600 px-4 py-2 rounded-lg"
>

Add Ticket Tier

</button>

</div>

  )
}