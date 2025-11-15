import React from 'react';
import './project.css';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/project')({
	component: RouteComponent,
});

type CardItem = {
	id: string;
	title: string;
	url: string;
	role: 'owner' | 'editor' | 'viewer' | string;
};

function sampleItems(): CardItem[] {
	const roles: Array<CardItem['role']> = ['owner', 'editor', 'viewer'];
	return Array.from({ length: 30 }, (_, i) => {
		const idx = i + 1;
		return {
			id: `b${idx}`,
			title: `Project ${idx}`,
			url: `https://example.com/project-${idx}`,
			role: roles[i % roles.length],
		} as CardItem;
	});
}

function RouteComponent() {
	const items = React.useMemo(() => sampleItems(), []);

	return (
		<div style={{ padding: 20 }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
				<div className="projects-title-card">
					<h2>Projects</h2>
				</div>
			</div>

			<div className="project-grid" role="list">
				{items.map((it) => (
					<article key={it.id} className="project-card" role="listitem" tabIndex={0}>
						<div className="project-card__content">
							<div className="project-card__fields">
								<div className="project-card__field project-card__title">
									<h3 style={{ margin: 0 }}>{it.title}</h3>
								</div>
								<div className="project-card__field project-card__url">{it.url}</div>
								<div className="project-card__field">
									<span className="role-label">Role:</span>{' '}
									<span className={`project-card__role role-${it.role}`}>{it.role}</span>
								</div>
							</div>
						</div>

						<div className="project-card__actions" style={{ marginTop: 12 }}>
							<button
								className="btn"
								onClick={() => window.open(it.url, '_blank', 'noopener,noreferrer')}
							>
								Open
							</button>
						</div>
					</article>
				))}
			</div>
		</div>
	);
}

export default RouteComponent;

