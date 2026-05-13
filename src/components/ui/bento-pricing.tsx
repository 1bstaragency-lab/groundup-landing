import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, SparklesIcon } from 'lucide-react';

type PricingCardProps = {
	titleBadge: string;
	priceLabel: string;
	priceSuffix?: string;
	features: string[];
	cta?: string;
	className?: string;
    isPrimary?: boolean;
	onSelect?: () => void;
};

function FilledCheck() {
	return (
		<div className="bg-[#FFD700] text-black rounded-full p-0.5">
			<CheckIcon className="size-3" strokeWidth={4} />
		</div>
	);
}

export function PricingCard({
	titleBadge,
	priceLabel,
	priceSuffix = '/month',
	features,
	cta = 'Subscribe',
	className,
    isPrimary = false,
	onSelect,
}: PricingCardProps) {
	return (
		<div
			className={cn(
				'bg-zinc-950 border-white/5 relative overflow-hidden rounded-[2rem] border p-2',
				'supports-[backdrop-filter]:bg-zinc-950/50 backdrop-blur-xl',
                isPrimary && 'border-[#FFD700]/30 shadow-[0_0_50px_rgba(255,215,0,0.1)]',
				className,
			)}
		>
			<div className="flex items-center gap-3 p-6">
				<Badge variant={isPrimary ? "default" : "secondary"}>{titleBadge}</Badge>
				<div className="ml-auto">
					<Button onClick={onSelect} variant={isPrimary ? "default" : "outline"} size="sm" className="rounded-full font-black uppercase text-[10px] tracking-widest cursor-pointer">{cta}</Button>
				</div>
			</div>

			<div className="flex items-end gap-2 px-6 py-4">
				<span className="font-black text-6xl tracking-tighter text-white">
					{priceLabel}
				</span>
				{priceLabel.toLowerCase() !== 'free' && (
					<span className="text-white/30 text-xs font-black uppercase tracking-widest mb-2">{priceSuffix}</span>
				)}
			</div>

			<ul className="text-white/40 grid gap-5 p-6 text-[13px] font-medium">
				{features.map((f, i) => (
					<li key={i} className="flex items-center gap-4">
						<FilledCheck />
						<span className="tracking-tight">{f}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

export function BentoPricing({ onSelect }: { onSelect?: () => void }) {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-8">
			{/* Growth Tier - The HERO Section */}
			<div
				className={cn(
					'bg-zinc-950 border-[#FFD700]/40 relative w-full overflow-hidden rounded-[2.5rem] border p-2',
					'supports-[backdrop-filter]:bg-zinc-950/50 backdrop-blur-2xl',
					'lg:col-span-5 shadow-[0_0_80px_rgba(255,215,0,0.15)]',
				)}
			>
				<div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
					<div className="from-[#FFD700]/20 to-transparent absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
						<div
							aria-hidden="true"
							className={cn(
								'absolute inset-0 size-full mix-blend-overlay',
								'bg-[linear-gradient(to_right,rgba(255,215,0,0.15)_1px,transparent_1px)]',
								'bg-[size:24px]',
							)}
						/>
					</div>
				</div>
				<div className="flex items-center gap-3 p-8 relative z-10">
					<Badge variant="default" className="px-4 py-1.5 text-[11px]">GROWTH</Badge>
					<Badge variant="outline" className="hidden lg:flex px-4 py-1.5 text-[11px] bg-white/5 border-white/20">
						<SparklesIcon className="me-2 size-3 text-[#FFD700]" /> MOST POPULAR
					</Badge>
					<div className="ml-auto">
						<Button onClick={onSelect} className="rounded-full font-black uppercase text-[11px] tracking-widest px-10 h-12 shadow-[0_10px_20px_rgba(255,215,0,0.2)] cursor-pointer">SELECT GROWTH</Button>
					</div>
				</div>
				<div className="flex flex-col p-8 lg:flex-row relative z-10">
					<div className="pb-6 lg:w-[35%]">
						<p className="text-[#FFD700] text-[10px] font-black tracking-[0.3em] uppercase mb-4">Everything Loop gives you, plus the actual creative.</p>
						<span className="font-black text-8xl tracking-tighter text-white leading-none">
							$30
						</span>
						<span className="text-white/30 text-sm font-black uppercase tracking-widest ml-3">/mo</span>
                        <p className="text-white/20 text-[10px] font-black uppercase mt-4">Annual: $300 (Save $60)</p>
					</div>
					<ul className="text-white/60 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 lg:w-[65%] text-[14px] font-bold">
						{[
							'Content Bundle / 35 Credits',
							'Personalized Rollout Strategy',
                            'Real-time Performance Data',
                            'Priority AI Processing',
                            'Strategic Creative Tools'
						].map((f, i) => (
							<li key={i} className="flex items-center gap-4">
								<FilledCheck />
								<span className="leading-tight tracking-tight text-white/80">{f}</span>
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* Foundation Tier */}
			<PricingCard
				titleBadge="FOUNDATION"
				priceLabel="$15"
				features={[
					'Start the system.',
					'Standard Management OS',
					'AI Content Assistant',
                    'Annual: $150 (Save $30)'
				]}
				className="lg:col-span-3 border-white/10"
                cta="GET STARTED"
				onSelect={onSelect}
			/>

			{/* Breakout Tier */}
			<PricingCard
				titleBadge="BREAKOUT"
				priceLabel="$50"
				features={[
					'What serious artists need.',
					'Content Bundle (10 Content, 3 Viz, 3 Lyric)',
                    '60 Infrastructure Credits',
                    'Priority Support & Recs',
                    'Annual: $500 (Save $100)'
				]}
				className="lg:col-span-4 border-[#FFD700]/20"
                cta="SELECT BREAKOUT"
                isPrimary
				onSelect={onSelect}
			/>

			{/* Concierge Tier */}
			<div
				className={cn(
					'bg-zinc-950 border-white/5 relative overflow-hidden rounded-[2rem] border p-2 flex flex-col',
					'supports-[backdrop-filter]:bg-zinc-950/50 backdrop-blur-xl lg:col-span-4',
				)}
			>
				<div className="flex items-center gap-3 p-8">
					<Badge variant="secondary" className="px-4 py-1.5 text-[11px]">CONCIERGE</Badge>
				</div>

				<div className="flex flex-col px-8 py-4">
					<span className="font-black text-5xl tracking-tighter text-white">
						Talk to us
					</span>
					<span className="text-white/10 text-[9px] font-black uppercase tracking-widest mt-2">White-glove, dedicated assistance. Starts from $500/mo.</span>
				</div>

				<ul className="text-white/40 grid gap-5 p-8 text-[13px] font-bold flex-1">
					{[
						'Dedicated 1-on-1 Assistant',
						'Exclusive Influencer Network',
						'PR & Global Playlist Access',
						'Full Custom Creative Agency'
					].map((f, i) => (
						<li key={i} className="flex items-center gap-4">
							<div className="w-1.5 h-1.5 rounded-full bg-[#FFD700]/40" />
							<span className="tracking-tight">{f}</span>
						</li>
					))}
				</ul>
                <div className="p-8 mt-auto">
                    <Button onClick={onSelect} variant="outline" className="w-full rounded-full font-black uppercase text-[11px] tracking-widest h-12 border-white/20 hover:bg-[#FFD700] hover:text-black hover:border-transparent transition-all cursor-pointer">Book A Call</Button>
                </div>
			</div>
		</div>
	);
}
