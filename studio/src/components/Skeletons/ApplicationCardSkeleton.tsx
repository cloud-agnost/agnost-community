import './skeleton.scss';
export default function ApplicationCardSkeleton() {
	return (
		<>
			{Array.from({ length: 5 }).map((_, i) => (
				<div className='application-card animate-pulse' key={i}>
					<div className='application-card-content'>
						<div className='application-card-avatar' />
						<div className='application-card-head'>
							<div className='application-card-info'>
								<span className='application-card-name'></span>
								<span className='application-card-role '></span>
							</div>
							<div className='application-card-team'>
								<span className='application-card-team-member'></span>
								<span className='application-card-team-member'></span>
								<span className='application-card-team-member'></span>
								<span className='application-card-team-member'></span>
							</div>
						</div>
					</div>
					<div className='application-card-footer'>
						<span className='application-card-footer-item'></span>
					</div>
				</div>
			))}
		</>
	);
}
