import React, { useState } from 'react'
import "./FirstUploads.scss"
import { useQuery } from '@apollo/client'
import { NEW_CONTENT } from '../graphql/queries'
import CardSkeleton from '../components/Cards/CardSkeleton'
import Card3 from "../components/Cards/Card3";

const VIDEOS_PER_PAGE = 50;

const NewVideos = () => {
  const [skip, setSkip] = useState(0);
  const [allVideos, setAllVideos] = useState([]);
  
  const { data, loading, error } = useQuery(NEW_CONTENT, {
    variables: { limit: VIDEOS_PER_PAGE, skip },
    onCompleted: (newData) => {
      const newItems = newData?.socialFeed?.items || [];
      if (skip === 0) {
        setAllVideos(newItems);
      } else {
        setAllVideos(prev => [...prev, ...newItems]);
      }
    }
  });

  // Transform GraphQL response to match Card3 expected format
  const videos = allVideos.map(item => ({
    ...item,
    author: item.author?.username || item.author,
    duration: item.spkvideo?.duration,
    created_at: item.created_at,
  }));

  const handleLoadMore = () => {
    setSkip(prev => prev + VIDEOS_PER_PAGE);
  };

  const hasMore = data?.socialFeed?.items?.length === VIDEOS_PER_PAGE;

  return (
    <div className='firstupload-container'>
      <div className='headers'>New VIDEOS</div>
      {loading && skip === 0 ? (
        <CardSkeleton />
      ) : (
        <>
          <Card3 videos={videos} loading={false} />
          {hasMore && (
            <button 
              className="load-more-btn" 
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </>
      )}
      {error && <p>Error fetching videos</p>}
    </div>
  );
};

export default NewVideos;
