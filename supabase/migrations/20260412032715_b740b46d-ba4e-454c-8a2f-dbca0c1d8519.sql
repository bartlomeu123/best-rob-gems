CREATE TRIGGER update_votes_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.update_game_vote_counts();