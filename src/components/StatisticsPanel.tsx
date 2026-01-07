import { BarChart3, Clock, BookOpen, Tv, Eye, TrendingUp, Calendar } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid
} from 'recharts';
import { cn } from '@/lib/utils';

interface StatisticsData {
  totalItems: number;
  totalAnime: number;
  totalManga: number;
  totalManhwa: number;
  totalEpisodes: number;
  totalChapters: number;
  totalVolumes: number;
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  completedItems: number;
  watchingItems: number;
  droppedItems: number;
  averageScore: number;
  topGenres: [string, number][];
  scoreDistribution: { score: number; count: number }[];
  statusDistribution: { status: string; count: number }[];
  activityHistory: { date: string; count: number; fullDate: string }[];
}

interface StatisticsPanelProps {
  stats: StatisticsData;
  className?: string;
}

const COLORS = ['#14b8a6', '#f97316', '#8b5cf6', '#ef4444', '#22c55e'];

export function StatisticsPanel({ stats, className }: StatisticsPanelProps) {
  const typeData = [
    { name: 'Anime', value: stats.totalAnime, color: '#14b8a6' },
    { name: 'Mangá', value: stats.totalManga, color: '#f97316' },
    { name: 'Manhwa', value: stats.totalManhwa, color: '#8b5cf6' },
  ].filter((d) => d.value > 0);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Total de Itens"
          value={stats.totalItems.toString()}
          color="text-primary"
        />
        <StatCard
          icon={Tv}
          label="Episódios"
          value={stats.totalEpisodes.toLocaleString()}
          color="text-accent"
        />
        <StatCard
          icon={Eye}
          label="Capítulos"
          value={stats.totalChapters.toLocaleString()}
          color="text-primary"
        />
        <StatCard
          icon={Clock}
          label="Tempo Assistido"
          value={`${stats.totalDays}d ${stats.totalHours % 24}h`}
          color="text-accent"
        />
      </div>

      {/* Activity Chart */}
      <div className="bg-card rounded-2xl p-6 shadow-kioku">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-xl text-card-foreground">Atividade Recente</h3>
            <p className="text-sm text-muted-foreground">Itens completados nos últimos 12 meses</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.activityHistory}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Type Distribution */}
        <div className="bg-card rounded-2xl p-6 shadow-kioku">
          <h3 className="font-display text-xl text-card-foreground mb-4">Por Tipo</h3>
          {typeData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Sem dados</p>
          )}
          <div className="flex justify-center gap-4 mt-4">
            {typeData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-sm text-muted-foreground">
                  {d.name}: {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-card rounded-2xl p-6 shadow-kioku">
          <h3 className="font-display text-xl text-card-foreground mb-4">Distribuição de Notas</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.scoreDistribution.filter((d) => d.count > 0)}>
                <XAxis dataKey="score" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status & Genres */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-card rounded-2xl p-6 shadow-kioku">
          <h3 className="font-display text-xl text-card-foreground mb-4">Por Status</h3>
          <div className="space-y-3">
            {stats.statusDistribution.map((item, index) => (
              <div key={item.status} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.status}</span>
                  <span className="text-card-foreground font-medium">{item.count}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.totalItems > 0 ? (item.count / stats.totalItems) * 100 : 0}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Genres */}
        <div className="bg-card rounded-2xl p-6 shadow-kioku">
          <h3 className="font-display text-xl text-card-foreground mb-4">Gêneros Favoritos</h3>
          {stats.topGenres.length > 0 ? (
            <div className="space-y-3">
              {stats.topGenres.map(([genre, count], index) => (
                <div key={genre} className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-display text-sm"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length] + '20',
                      color: COLORS[index % COLORS.length],
                    }}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-card-foreground font-medium">{genre}</p>
                    <p className="text-xs text-muted-foreground">{count} títulos</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Sem dados</p>
          )}
        </div>
      </div>

      {/* Average Score */}
      <div className="bg-card rounded-2xl p-6 shadow-kioku">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl text-card-foreground">Nota Média</h3>
            <p className="text-muted-foreground text-sm">Baseado em todos os itens avaliados</p>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl text-primary">
              {stats.averageScore > 0 ? stats.averageScore.toFixed(1) : '—'}
            </p>
            <p className="text-muted-foreground text-sm">/10</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-kioku">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', color, 'bg-current/10')}>
        <Icon className={cn('h-5 w-5', color)} />
      </div>
      <p className="text-2xl font-display text-card-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
