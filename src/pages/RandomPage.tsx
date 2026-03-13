import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApprovedGames } from '@/lib/supabaseData';

const RandomPage = () => {
  const navigate = useNavigate();
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (tried) return;
    setTried(true);
    fetchApprovedGames().then(games => {
      if (games.length > 0) {
        const game = games[Math.floor(Math.random() * games.length)];
        navigate(`/game/${game.slug}`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    });
  }, [navigate, tried]);

  return null;
};

export default RandomPage;
