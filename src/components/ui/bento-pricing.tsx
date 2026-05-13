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
};

function FilledCheck() {
	return (
		<div className="bg-[#FFD700] text-black rounded-full p-0.5">
			<CheckIcon className="size-3" strokeWidth={4} />
		</div>
	);
}

function PricingCard({
	titleBadge,
	priceLabel,
	priceSuffix = '/month',
	features,
	cta = 'Subscribe',
	className,
    isPrimary = false
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
					<Button variant={isPrimary ? "default" : "outline"} size="sm" className="rounded-full font-black uppercase text-[10px] tracking-widest">{cta}</Button>
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

export function BentoPricing() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-8">
			<div
				className={cn(
					'bg-zinc-950 border-[#FFD700]/30 relative w-full overflow-hidden rounded-[2rem] border p-2',
					'supports-[backdrop-filter]:bg-zinc-950/50 backdrop-blur-xl',
					'lg:col-span-5 shadow-[0_0_50px_rgba(255,215,0,0.1)]',
				)}
			>
				<div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
					<div className="from-[#FFD700]/10 to-transparent absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
						<div
							aria-hidden="true"
							className={cn(
								'absolute inset-0 size-full mix-blend-overlay',
								'bg-[linear-gradient(to_right,rgba(255,215,0,0.1)_1px,transparent_1px)]',
								'bg-[size:24px]',
							)}
						/>
					</div>
				</div>
				<div className="flex items-center gap-3 p-6 relative z-10">
					<Badge variant="default">CREATORS SPECIAL</Badge>
					<Badge variant="outline" className="hidden lg:flex">
						<SparklesIcon className="me-2 size-3" /> MOST RECOMMENDED
					</Badge>
					<div className="ml-auto">
						<Button className="rounded-full font-black uppercase text-[10px] tracking-widest px-8">GET STARTED</Button>
					</div>
				</div>
				<div className="flex flex-col p-6 lg:flex-row relative z-10">
					<div className="pb-4 lg:w-[30%]">
						<span className="font-black text-7xl tracking-tighter text-white">
							$19
						</span>
						<span className="text-white/30 text-xs font-black uppercase tracking-widest ml-2">/month</span>
					</div>
					<ul className="text-white/40 grid gap-5 lg:w-[70%] text-[14px] font-medium">
						{[
							'AI-Powered A&R & Management tools',
							'Real-time Listener & Performance Analytics',
							'Automated Press Kit & Distribution Tools',
							'Priority Support & Strategic Consultation',
						].map((f, i) => (
							<li key={i} className="flex items-center gap-4">
								<FilledCheck />
								<span className="leading-relaxed tracking-tight">{f}</span>
							</li>
						))}
					</ul>
				</div>
			</div>

			<PricingCard
				titleBadge="STARTERS"
				priceLabel="FREE"
				features={[
					'Basic Management OS Access',
					'Unlimited Asset Storage',
					'Community Discord Access',
				]}
				className="lg:col-span-3"
                cta="START FREE"
			/>

			<PricingCard
				titleBadge="TEAMS"
				priceLabel="$49"
				features={[
					'Up to 5 Team Members',
					'Collaborative Project Tracking',
					'Advanced Team Permissions',
				]}
				className="lg:col-span-4"
                isPrimary
			/>

			<PricingCard
				titleBadge="ENTERPRISE"
				priceLabel="$99"
				features={[
					'Unlimited Team Access',
					'Custom White-Label Dashboards',
					'Dedicated Account Manager',
				]}
				className="lg:col-span-4"
			/>
		</div>
	);
}
