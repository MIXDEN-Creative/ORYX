import Link from "next/link";
import { CalendarDays, MapPin, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type EventCardProps = {
  href: string;
  title: string;
  date: string;
  location: string;
  price: string;
  category: string;
};

export function EventCard({
  href,
  title,
  date,
  location,
  price,
  category,
}: EventCardProps) {
  return (
    <Card className="group overflow-hidden rounded-[24px] border border-zinc-800 bg-zinc-950/80 transition-all duration-300 hover:-translate-y-1 hover:border-[#A259FF]/50 hover:shadow-[0_0_0_1px_rgba(162,89,255,0.16),0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="h-40 w-full bg-[linear-gradient(135deg,#18181b,rgba(162,89,255,0.22))]" />

      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Badge className="border-0 bg-[#A259FF]/15 text-[#CDA8FF] hover:bg-[#A259FF]/20">
            {category}
          </Badge>

          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Starting at
            </p>
            <p className="mt-1 text-xl font-semibold text-white">{price}</p>
          </div>
        </div>

        <CardTitle className="line-clamp-2 text-2xl font-semibold tracking-tight text-white">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <CalendarDays className="h-4 w-4 text-zinc-500" />
          <span>{date}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <MapPin className="h-4 w-4 text-zinc-500" />
          <span>{location}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button
          asChild
          className="w-full bg-white text-black transition hover:bg-zinc-200"
        >
          <Link href={href} className="flex items-center justify-center gap-2">
            View Event
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}