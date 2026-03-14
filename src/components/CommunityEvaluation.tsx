import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props {
  comments: any[];
}

const CommunityEvaluation = ({ comments }: Props) => {
  const { topPros, topCons } = useMemo(() => {
    const proCounts: Record<string, number> = {};
    const conCounts: Record<string, number> = {};

    for (const c of comments) {
      for (const p of c.pros || []) proCounts[p] = (proCounts[p] || 0) + 1;
      for (const co of c.cons || []) conCounts[co] = (conCounts[co] || 0) + 1;
    }

    const topPros = Object.entries(proCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name);

    const topCons = Object.entries(conCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name);

    return { topPros, topCons };
  }, [comments]);

  if (topPros.length === 0 && topCons.length === 0) return null;

  const rows = Math.max(topPros.length, topCons.length);

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-display text-xl font-bold mb-4">Community Evaluation</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-green-400 font-semibold">👍 Pros</TableHead>
            <TableHead className="text-red-400 font-semibold">👎 Cons</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="text-sm">{topPros[i] || ''}</TableCell>
              <TableCell className="text-sm">{topCons[i] || ''}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
};

export default CommunityEvaluation;
