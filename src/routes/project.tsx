import React from 'react';
import './project.css';
import ListIcon from '../components/Icons/ListIcon';
import ThreeColIcon from '../components/Icons/ThreeColIcon';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/project' as any)({
	component: RouteComponent,
});

type CardItem = {
    id: string;
    title: string;
    url: string;
    role: 'owner' | 'editor' | 'viewer' | string;
};

//  db stuff
function sampleItems(): CardItem[] {
	return [
		{
			id: '1',
			title: 'Project A',
			url: 'https://example.com/project-a',
			role: 'owner',
		},
		{
			id: '2',
			title: 'Project B',
			url: 'https://example.com/project-b',
			role: 'editor',
		},
		{
			id: '3',
			title: 'Project C',
			url: 'https://example.com/project-c',
			role: 'viewer',
		},
	];
}

function RouteComponent() {
	const items = React.useMemo(() => sampleItems(), []);
		const [view, setView] = React.useState<'list' | '3col'>('3col');

	return (
		<div style={{ padding: 20 }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
				<div className="projects-title-card">
					<h2>Projects</h2>
				</div>

				<div className="view-toggle" role="tablist" aria-label="View mode">
															<button
																className={`icon-btn ${view === 'list' ? 'active' : ''}`}
																onClick={() => setView('list')}
																role="tab"
																aria-selected={view === 'list'}
																aria-label="List view"
															>
																<ListIcon />
															</button>

															<div className="view-toggle__indicator" aria-hidden>
																{view === 'list' ? 'List' : '3‑Column'}
															</div>

															<button
																className={`icon-btn ${view === '3col' ? 'active' : ''}`}
																onClick={() => setView('3col')}
																role="tab"
																aria-selected={view === '3col'}
																aria-label="Three column view"
															>
																<ThreeColIcon />
															</button>
														</div>
			</div>

			<div className={`project-grid view--${view}`} role="list">
				{items.map((it) => (
					<article key={it.id} className="project-card" role="listitem" tabIndex={0}>
						<div className="project-card__fields">
							<div className="project-card__field project-card__title">
								<h3 style={{ margin: 0 }}>{it.title}</h3>
							</div>
							<div className="project-card__field project-card__url">{it.url}</div>
							<div className={`project-card__field project-card__role role-${it.role}`}>{it.role}</div>
						</div>
												<div className="project-card__footer">
													<button
														className="btn"
														onClick={() => {
															// open the project's URL in a new tab safely
															// use noopener,noreferrer to avoid giving the new page access to window.opener
															window.open(it.url, '_blank', 'noopener,noreferrer');
														}}
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

