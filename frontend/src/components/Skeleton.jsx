import '../assets/Skeleton.css';

const PostSkeleton = () => (
  <div className="skeleton-card mb-4">
    <div className="flex items-center gap-3 mb-4">
      <div className="skeleton skeleton-avatar"></div>
      <div className="flex-1">
        <div className="skeleton skeleton-title"></div>
      </div>
    </div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
  </div>
);

const ProfileSkeleton = () => (
  <div className="p-8">
    <div className="flex items-center gap-6 mb-12">
      <div className="skeleton" style={{ width: '120px', height: '120px', borderRadius: '24px' }}></div>
      <div className="flex-1">
        <div className="skeleton skeleton-title" style={{ height: '2rem' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '30%' }}></div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="skeleton" style={{ height: '200px', borderRadius: '24px' }}></div>
      <div className="skeleton" style={{ height: '200px', borderRadius: '24px' }}></div>
    </div>
  </div>
);

export { PostSkeleton, ProfileSkeleton };
