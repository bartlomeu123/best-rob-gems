import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRandomGame } from '@/lib/mockData';

const RandomPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const game = getRandomGame();
    navigate(`/game/${game.slug}`, { replace: true });
  }, [navigate]);
  return null;
};

export default RandomPage;
