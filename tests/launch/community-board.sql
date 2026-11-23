-- Run only in an isolated database that already contains the migration and the
-- synthetic public.User rows board-owner and board-player. Roll back all fixtures.
BEGIN;
INSERT INTO wga_board.editors VALUES ('board-owner');
SET LOCAL ROLE wga_runtime;
DO $test$
DECLARE pid uuid:=gen_random_uuid(); cid uuid:=gen_random_uuid(); key text:=repeat('a',64);
BEGIN
 IF has_table_privilege(current_user,'wga_board.editors','INSERT')
 OR has_table_privilege(current_user,'wga_board.comments','SELECT') THEN RAISE EXCEPTION 'direct access'; END IF;
 IF wga_board.is_editor('board-player') OR wga_board.is_editor(NULL) THEN RAISE EXCEPTION 'editor scope'; END IF;
 BEGIN
   PERFORM wga_board.edit('board-player','publish',pid,'Player post','Body');
   RAISE EXCEPTION 'player published';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'editor required' THEN RAISE; END IF; END;
 PERFORM wga_board.edit('board-owner','publish',pid,'Game update','Welcome to the discussion');
 PERFORM wga_board.edit('board-owner','publish',pid,'Game update','Welcome to the discussion');
 IF (SELECT count(*) FROM wga_board.feed(NULL,1) WHERE id=pid)<>1 THEN RAISE EXCEPTION 'publish retry'; END IF;
 PERFORM wga_board.respond('board-player',pid,cid,'like','',key);
 PERFORM wga_board.respond('board-player',pid,cid,'like','',key);
 IF NOT (SELECT liked AND likes=1 FROM wga_board.feed('board-player',1) WHERE id=pid) THEN RAISE EXCEPTION 'like'; END IF;
 IF (SELECT liked FROM wga_board.feed(NULL,1) WHERE id=pid) THEN RAISE EXCEPTION 'anonymous like state'; END IF;
 PERFORM wga_board.respond('board-player',pid,cid,'unlike','',key);
 IF (SELECT likes FROM wga_board.feed(NULL,1) WHERE id=pid)<>0 THEN RAISE EXCEPTION 'unlike'; END IF;
 PERFORM wga_board.respond('board-player',pid,cid,'comment','Which level next?',key);
 PERFORM wga_board.respond('board-player',pid,cid,'comment','Which level next?',key);
 IF EXISTS(SELECT FROM wga_board.replies(pid,1)) OR EXISTS(SELECT FROM wga_board.pending('board-player'))
 OR (SELECT count(*) FROM wga_board.pending('board-owner') WHERE id=cid)<>1 THEN RAISE EXCEPTION 'review queue'; END IF;
 PERFORM wga_board.edit('board-owner','approve',cid,'','');
 IF (SELECT count(*) FROM wga_board.replies(pid,1) WHERE id=cid)<>1 THEN RAISE EXCEPTION 'approval'; END IF;
 PERFORM wga_board.edit('board-owner','remove',cid,'','');
 IF EXISTS(SELECT FROM wga_board.replies(pid,1)) THEN RAISE EXCEPTION 'removal'; END IF;
END $test$;
ROLLBACK;
