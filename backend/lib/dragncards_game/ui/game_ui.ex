defmodule DragnCardsGame.GameUI do
  @moduledoc """
  One level on top of Game.
  """


  require Logger
  alias DragnCardsGame.{Game, GameUI, GameUISeat, Groups, Group, Stack, Card, User, Tokens, CardFace, PlayerInfo, Evaluate}
  alias DragnCardsChat.{ChatMessage}

  alias DragnCards.{Repo, Replay, Plugins}
  alias DragnCards.Rooms.Room

  @type t :: Map.t()

  @spec new(String.t(), integer(), Map.t()) :: GameUI.t()
  def new(room_slug, user_id, %{} = options) do
    IO.puts("gameui new 1")
    gameui = %{
      "game" => Game.load(room_slug, options),
      "roomSlug" => room_slug,
      "options" => options,
      "createdAt" => DateTime.utc_now(),
      "createdBy" => user_id,
      "privacyType" => options["privacyType"],
      "playerInfo" => %{
        "player1" => PlayerInfo.new(user_id)
      },
      "deltas" => [],
      "replayStep" => 0,
      "replayLength" => 0, # Length of deltas. We need this because the delta array is not broadcast.
      "sockets" => %{},
      "logTimestamp" => nil,
      "logMessages" => [] # These game messages will be delivered to chat
    }
    IO.puts("gameui new 2")
    gameui
  end

  def pretty_print(game, header \\ nil) do
    IO.puts(header)
    Enum.each(game["groupById"], fn({group_id, group}) ->
      stack_ids = get_stack_ids(game, group_id)
      stacks_size = Enum.count(stack_ids)
      if stacks_size > 0 do
        IO.puts(group["id"])
        Enum.each(stack_ids, fn(stack_id) ->
          IO.puts("  #{stack_id}")
          card_ids = get_card_ids(game, stack_id)
          Enum.each(Enum.with_index(card_ids), fn({card_id, index}) ->
            card = get_card(game, card_id)
            indent = if index > 0 do
              "  "
            else
              ""
            end
            card_name = card["sides"][card["currentSide"]]["name"]
            card_id = card["id"]
            IO.puts("#{indent}  #{card_name} #{card_id}")
          end)
        end)
      end
    end)
  end


  ############################################################
  # Getters                                                  #
  ############################################################

  def get_group(game, group_id) do
    game["groupById"][group_id]
  end

  def get_group_controller(game, group_id) do
    group = get_group(game, group_id)
    if group do group["controller"] else nil end
  end

  def get_group_type(game, group_id) do
    group = get_group(game, group_id)
    if group do group["type"] else nil end
  end

  def get_stack_ids(game, group_id) do
    get_group(game,group_id)["stackIds"]
  end

  def get_stack(game, stack_id) do
    game["stackById"][stack_id]
  end

  def get_card_ids(game, stack_id) do
    get_stack(game, stack_id)["cardIds"]
  end

  def get_card(game, card_id) do
    game["cardById"][card_id]
  end

  def get_targeting(game, card_id) do
    get_card(game, card_id)["targeting"]
  end

  def get_tokens(game, card_id) do
    get_card(game, card_id)["tokens"]
  end

  def get_token(game, card_id, token_type) do
    get_tokens(game, card_id)[token_type]
  end

  def get_tokens_per_round(game, card_id) do
    get_card(game, card_id)["tokensPerRound"]
  end

  def get_token_per_round(game, card_id, token_type) do
    get_tokens_per_round(game, card_id)[token_type]
  end

  def get_current_card_face(game, card_id) do
    card = get_card(game, card_id)
    card["sides"][card["currentSide"]]
  end

  def get_group_by_stack_id(game, stack_id) do
    Enum.reduce(game["groupById"], nil, fn({group_id, group}, acc) ->
      acc = if stack_id in group["stackIds"] do group else acc end
    end)
  end

  def get_group_by_card_id(game, card_id) do
    stack = get_stack_by_card_id(game, card_id)
    get_group_by_stack_id(game, stack["id"])
  end

  def get_stack_index_by_stack_id(game, stack_id) do
    group_id = get_group_by_stack_id(game, stack_id)["id"]
    stack_ids = get_stack_ids(game, group_id)
    if is_list(stack_ids) do
      Enum.find_index(stack_ids, fn id -> id == stack_id end)
    else
      0
    end
  end

  def get_stack_by_card_id(game, card_id) do
    Enum.reduce(game["stackById"], nil, fn({stack_id, stack}, acc) ->
      acc = if card_id in stack["cardIds"] do stack else acc end
    end)
  end

  def get_stack_by_index(game, group_id, stack_index) do
    stack_ids = game["groupById"][group_id]["stackIds"]
    game["stackById"][Enum.at(stack_ids, stack_index)]
  end

  def get_card_index_by_card_id(game, card_id) do
    stack_id = get_stack_by_card_id(game, card_id)["id"]
    card_ids = get_card_ids(game, stack_id)
    Enum.find_index(card_ids, fn id -> id == card_id end)
  end

  def gsc(game, card_id) do
    stack = get_stack_by_card_id(game, card_id)
    stack_id = stack["id"]
    card_index = get_card_index_by_card_id(game, card_id)
    stack_index = get_stack_index_by_stack_id(game, stack_id)
    group_id = get_group_by_stack_id(game, stack_id)["id"]
    {group_id, stack_index, card_index}
  end

  def get_card_by_gsc(game, gsc) do
    group_id = Enum.at(gsc,0)
    stack_index = Enum.at(gsc,1)
    card_index = Enum.at(gsc,2)
    group = get_group(game, group_id)
    stack_ids = group["stackIds"]
    if Enum.count(stack_ids) <= stack_index do
      nil
    else
      stack = get_stack(game, Enum.at(stack_ids, stack_index))
      card_ids = stack["cardIds"]
      if Enum.count(card_ids) <= card_index do
        nil
      else
        get_card(game, Enum.at(card_ids, card_index))
      end
    end
  end

  ############################################################
  # Updaters                                                 #
  ############################################################

  def update_group(game, new_group) do
    put_in(game["groupById"][new_group["id"]], new_group)
  end

  def update_stack_ids(game, group_id, new_stack_ids) do
    put_in(game["groupById"][group_id]["stackIds"], new_stack_ids)
  end

  def update_stack(game, new_stack) do
    put_in(game["stackById"][new_stack["id"]], new_stack)
  end

  def update_card_ids(game, stack_id, new_card_ids) do
    put_in(game["stackById"][stack_id]["cardIds"], new_card_ids)
  end

  def update_card(game, new_card) do
    put_in(game["cardById"][new_card["id"]], new_card)
  end

  # Move a card
  def move_card(game, card_id, dest_group_id, dest_stack_index, dest_card_index, combine \\ false) do
    # Get position of card
    {orig_group_id, orig_stack_index, orig_card_index} = gsc(game, card_id)
    # Get origin stack
    orig_stack = get_stack_by_index(game, orig_group_id, orig_stack_index)
    # Perpare destination stack
    game = if combine do
      game
    else
      new_stack = Stack.empty_stack()
      insert_new_stack(game, dest_group_id, dest_stack_index, new_stack)
    end
    # Get destination stack
    dest_stack = get_stack_by_index(game, dest_group_id, dest_stack_index)
    # Update game
    game
    |> remove_from_stack(card_id)
    |> add_to_stack(dest_stack["id"], card_id, dest_card_index)
    |> update_card_state(card_id, orig_group_id)
  end

  # Update a card state
  # Modify the card orientation/tokens based on where it is now
  def update_card_state(game, card_id, orig_group_id \\ nil) do
    {dest_group_id, dest_stack_index, dest_card_index} = gsc(game, card_id)
    orig_group = get_group(game, orig_group_id)
    dest_group = get_group(game, dest_group_id)
    card = get_card(game, card_id)
    prev_card = card
    IO.puts("updating card state ----------------------------------- prev_card")
    IO.inspect(prev_card)
    parent_card = get_card_by_gsc(game, [dest_group_id, dest_stack_index, 0])

    game = Evaluate.evaluate(game, ["SET", "/cardById/" <> card_id <> "/groupId", dest_group_id])
    game = Evaluate.evaluate(game, ["SET", "/cardById/" <> card_id <> "/stackIndex", dest_stack_index])
    game = Evaluate.evaluate(game, ["SET", "/cardById/" <> card_id <> "/cardIndex", dest_card_index])
    game = Evaluate.evaluate(game, ["SET", "/cardById/" <> card_id <> "/stackParentCardId", parent_card["id"]])

    # If card gets moved to a facedown pile, or gets flipped up, erase peeking
    IO.inspect(dest_group["onCardEnter"])
    IO.inspect(prev_card["currentSide"])
    game = if dest_group["onCardEnter"]["currentSide"] == "B" or (prev_card["currentSide"] == "B" and dest_group["onCardEnter"]["currentSide"] == "A") do
      Evaluate.evaluate(game, ["SET", "/cardById/" <> card_id <> "/peeking", %{}])
    else
      game
    end

    game = Enum.reduce(dest_group["onCardEnter"], game, fn({key, val}, acc) ->
      if orig_group["onCardEnter"][key] != dest_group["onCardEnter"][key] do
        IO.puts("updating card state Onenter: " <> key <> " " <> inspect(val))
        Evaluate.evaluate(acc, ["SET", "/cardById/" <> card_id <> "/" <> key, val])
      else
        acc
      end
    end)

    new_card = get_card(game, card_id)
    IO.puts("updating card state ----------------------------------- new_card")
    IO.inspect(new_card)

    game
  end

  # Delete card from game
  def delete_card(game, card_id) do
    card = get_card(game, card_id)
    game
    |> delete_card_from_card_by_id(card_id)
    |> remove_from_stack(card_id)
    |> refresh_stack_indices_in_group(card["groupId"])
  end

  def delete_card_from_card_by_id(game, card_id) do
    old_card_by_id = game["cardById"]
    new_card_by_id = Map.delete(old_card_by_id, card_id)
    put_in(game["cardById"], new_card_by_id)
  end

  # Removes a card from a stack, but it stays in cardById
  def remove_from_stack(game, card_id) do
    stack_id = get_stack_by_card_id(game, card_id)["id"]
    old_card_ids = get_card_ids(game, stack_id)
    card_index = get_card_index_by_card_id(game, card_id)
    new_card_ids = List.delete_at(old_card_ids, card_index)
    if Enum.count(new_card_ids) == 0 do
      delete_stack(game, stack_id)
    else
      update_card_ids(game, stack_id, new_card_ids)
    end
  end

  def refresh_stack_indices_in_group(game, group_id) do
    stack_ids = get_stack_ids(game, group_id)
    game = Enum.reduce(Enum.with_index(stack_ids), game, fn({stack_id, index}, acc) ->
      refresh_stack_indices_in_stack(acc, stack_id, index)
    end)
  end

  def refresh_stack_indices_in_stack(game, stack_id, index) do
    card_ids = get_card_ids(game, stack_id)
    Enum.reduce(card_ids, game, fn(card_id, acc) ->
      card = get_card(acc, card_id) |> Map.put("stackIndex", index)
      update_card(acc, card)
    end)
  end

  #################################################################
  # Stack actions                                                 #
  #################################################################


  def get_top_card_of_stack(game, stack_id) do
    stack = get_stack(game, stack_id)
    card_id = Enum.at(stack["cardIds"],0)
    get_card(game, card_id)
  end

  def delete_stack(game, stack_id) do
    game
    |> delete_stack_from_stack_by_id(stack_id)
    |> delete_stack_id_from_group_by_id(stack_id)
  end

  def delete_stack_from_stack_by_id(game, stack_id) do
    old_stack_by_id = game["stackById"]
    new_stack_by_id = Map.delete(old_stack_by_id, stack_id)
    put_in(game["stackById"], new_stack_by_id)
  end

  def delete_stack_id_from_group_by_id(game, stack_id) do
    old_group = get_group_by_stack_id(game, stack_id)
    old_stack_ids = old_group["stackIds"]
    stack_index = get_stack_index_by_stack_id(game, stack_id)
    new_stack_ids = List.delete_at(old_stack_ids, stack_index)
    update_stack_ids(game, old_group["id"], new_stack_ids)
  end

  def add_to_stack(game, stack_id, card_id, card_index) do
    old_card_ids = get_card_ids(game, stack_id)
    new_card_ids = List.insert_at(old_card_ids, card_index, card_id)
    update_card_ids(game, stack_id, new_card_ids)
  end

  def update_stack_state(game, stack_id, orig_group_id) do
    # Update cards in stack one at a time in reverse order
    # This is so that when the stack is removed from play,
    # order is preserved as cards are detached
    IO.puts("update_stack_state 1")
    stack = get_stack(game, stack_id)
    IO.puts("update_stack_state 2")
    dest_group = get_group_by_stack_id(game, stack_id)
    IO.puts("update_stack_state 3")
    dest_group_id = dest_group["id"]
    IO.puts("update_stack_state 4")
    card_ids = get_card_ids(game, stack_id)
    IO.puts("update_stack_state 5")
    game = Enum.reduce(card_ids, game, fn(card_id, acc) ->
      acc = update_card_state(acc, card_id, orig_group_id)
    end)
    IO.puts("update_stack_state 6")
    # If a stack is out of play, we need to split it up
    if Enum.count(card_ids)>1 && not dest_group["canHaveAttachments"] do
      IO.puts("update_stack_state 7")
      reverse_card_ids = Enum.reverse(card_ids)
      Enum.reduce(reverse_card_ids, game, fn(card_id, acc) ->
        IO.puts("update_stack_state 8")
        acc = detach(acc, card_id)
      end)
    else
      game
    end
  end

  # Detach a card
  def detach(gameui, card_id) do
    # Get position of card and move it next to the initial stack
    {group_id, stack_index, card_index} = gsc(gameui, card_id)
    move_card(gameui, card_id, group_id, stack_index + 1, 0, false)
  end

  def move_stack(game, stack_id, dest_group_id, dest_stack_index, combine \\ false) do
    IO.puts("move_stack #{stack_id} #{dest_group_id} #{dest_stack_index} #{combine}")
    if stack_id == nil do
      game
    else
      orig_group_id = get_group_by_stack_id(game, stack_id)["id"]
      orig_stack_index = get_stack_index_by_stack_id(game, stack_id)
      # If destination is negative, count backward from the end
      dest_stack_index = if dest_stack_index < 0 do
        loop_index = Enum.count(GameUI.get_stack_ids(game, dest_group_id)) + dest_stack_index
        if combine do
          loop_index
        else
          loop_index + 1
        end
      else
        dest_stack_index
      end
      # If attaching to same group at higher index, dest_index will end up being 1 less
      dest_stack_index = if orig_group_id == dest_group_id and combine and orig_stack_index < dest_stack_index do dest_stack_index - 1 else dest_stack_index end
      # Delete stack id from old group
      old_orig_stack_ids = get_stack_ids(game, orig_group_id)
      new_orig_stack_ids = List.delete_at(old_orig_stack_ids, orig_stack_index)
      game = update_stack_ids(game, orig_group_id, new_orig_stack_ids)
      # Add to new position
      game = if combine do
        # Get existing destination stack
        dest_stack = get_stack_by_index(game, dest_group_id, dest_stack_index)
        dest_stack_id = dest_stack["id"]
        # Update card ids of destination stack
        old_orig_card_ids = get_card_ids(game, stack_id)
        old_dest_card_ids = get_card_ids(game, dest_stack["id"])
        new_dest_card_ids = old_dest_card_ids ++ old_orig_card_ids
        game = update_card_ids(game, dest_stack_id, new_dest_card_ids)
        # Delete original stack
        game = delete_stack_from_stack_by_id(game, stack_id)
        game = update_stack_state(game, dest_stack_id, orig_group_id)
      else
        # Update destination group stack ids
        old_dest_stack_ids = get_stack_ids(game, dest_group_id)
        new_dest_stack_ids = List.insert_at(old_dest_stack_ids, dest_stack_index, stack_id)
        game = update_stack_ids(game, dest_group_id, new_dest_stack_ids)
        |> update_stack_state(stack_id, orig_group_id)
      end
    end
  end

  def move_stacks(game, orig_group_id, dest_group_id, top_n, position) do
    orig_stack_ids = get_stack_ids(game, orig_group_id)
    # Moving stacks to the top or the bottom of the new group?
    top_n = if top_n == -1 do Enum.count(orig_stack_ids) else top_n end
    dest_stack_index = if position == "bottom" do -1 else 0 end
    # Move stacks 1 at a time
    game = Enum.reduce(Enum.with_index(orig_stack_ids), game, fn({stack_id, index}, acc) ->
      if index < top_n do
        move_stack(acc, stack_id, dest_group_id, dest_stack_index)
      else
        acc
      end
    end)
    # Do we shuffle it in?
    if position == "shuffle" do shuffle_group(game, dest_group_id) else game end
  end

  def insert_card_in_stack(game, stack_id, card_id, index) do
    old_card_ids = game["stackById"][stack_id]["cardIds"]
    new_card_ids = List.insert_at(old_card_ids, index, card_id)
    update_card_ids(game, stack_id, new_card_ids)
  end

  #################################################################
  # Group actions                                                 #
  #################################################################

  def insert_new_stack(game, group_id, stack_index, stack) do
    old_stack_ids = get_stack_ids(game, group_id)
    new_stack_ids = List.insert_at(old_stack_ids, stack_index, stack["id"])
    game
    |> update_stack(stack)
    |> update_stack_ids(group_id, new_stack_ids)
  end

  def insert_stack_in_group(game, group_id, stack_id, index) do
    old_stack_ids = get_stack_ids(game, group_id)
    new_stack_ids = List.insert_at(old_stack_ids, index, stack_id)
    update_stack_ids(game, group_id, new_stack_ids)
  end

  ################################################################
  # Game actions                                                 #
  ################################################################

  def game_action(gameui, user_id, action, options) do
    user_alias = get_alias_by_user_id(gameui, user_id)
    player_n = get_player_n(gameui, user_id)
    player_n = if options["for_player_n"] do options["for_player_n"] else player_n end
    Logger.debug("game_action #{user_id} #{player_n} #{action}")
    game_old = gameui["game"]

    game_new = game_old
      |> put_in(["playerUi"], options["player_ui"])
      |> put_in(["messages"], [])
      |> resolve_action_type(action, options, player_n, user_id)
      |> Map.delete("playerUi")
      |> put_in(["variables"], %{})

    set_last_room_update(gameui)

    gameui
    |> put_in(["game"], game_new)
    |> update_log(game_new["messages"])
    |> add_delta(game_old)
  end

  def resolve_action_type(game, type, options, player_n, user_id) do
    case type do
      "evaluate" ->
        Evaluate.evaluate_with_timeout(game, options["action_list"])
      "set_game" ->
        options["game"]
      "reset_game" ->
        reset_game(game)
      "load_cards" ->
        load_cards(game, player_n, options["load_list"])
      "save_replay" ->
        save_replay(game, user_id)
      _ ->
        game
    end
  end

  def update_log(gameui, messages) do
    gameui
    |> put_in(["logTimestamp"], System.system_time(:millisecond))
    |> put_in(["logMessages"], messages)
  end

  def add_delta(gameui, prev_game) do
    game = gameui["game"]
    ds = gameui["deltas"]
    num_deltas = Enum.count(ds)
    new_step = gameui["replayStep"]+1
    gameui = put_in(gameui["replayStep"], new_step)
    gameui = put_in(gameui["replayLength"], new_step)
    d = get_delta(prev_game, game)
    if d do
      # add timestamp to delta
      timestamp = System.system_time(:millisecond)
      d = put_in(d["unix_ms"], "#{timestamp}")
      ds = Enum.slice(ds, Enum.count(ds)-gameui["replayStep"]+1..-1)
      ds = [d | ds]
      game = put_in(gameui["deltas"], ds)
    else
      game
    end
  end

  def step(gameui, direction) do
    case direction do
      "undo" ->
          undo(gameui)
      "redo" ->
        redo(gameui)
      _ ->
        gameui
    end
  end

  def undo(%{"replayStep" => replay_step, "deltas" => deltas, "game" => game} = gameui) do
    if replay_step > 0 do
      messages = game["messages"]
      delta = Enum.at(deltas, Enum.count(deltas)-replay_step)
      game = apply_delta(game, delta, "undo")
      messages = if messages == [] do
        [inspect(delta)]
      else
        messages
      end
      gameui
        |> update_log(Enum.map(messages, &("UNDO: " <> &1)))
        |> put_in(["game"], game)
        |> put_in(["replayStep"], replay_step-1)
    else
      update_log(gameui, ["UNDO: Nothing to undo"])
    end
  end

  def redo(%{"replayStep" => replay_step, "deltas" => deltas, "game" => game} = gameui) do
    if replay_step < Enum.count(deltas) do
      delta = Enum.at(deltas,Enum.count(deltas)-replay_step-1)
      game = apply_delta(game, delta, "redo")
      messages = game["messages"]
      messages = if messages == [] do
        [inspect(delta)]
      else
        messages
      end
      gameui
        |> update_log(Enum.map(messages, &("REDO: " <> &1)))
        |> put_in(["game"], game)
        |> put_in(["replayStep"], replay_step+1)
    else
      update_log(gameui, ["REDO: Nothing to redo"])
    end
  end

  def get_delta(game_old, game_new) do
    diff_map = MapDiff.diff(game_old, game_new)
    delta("game", diff_map)
  end

  def delta(key, diff_map) do
    case diff_map[:changed] do
      :equal ->
        nil
      :added ->
        [":removed", diff_map[:value]]
      # TODO: Check that removal behaves properly
      :removed ->
        [diff_map[:value], ":removed"]
      :primitive_change ->
        [diff_map[:removed],diff_map[:added]]
      :map_change ->
        diff_value = diff_map[:value]
        Enum.reduce(diff_value, %{}, fn({k,v},acc) ->
          d2 = delta(k, v)
          if v[:changed] != :equal and k != "playerUi" do
            acc |> Map.put(k, d2)
          else
            acc
          end
        end)
        _ ->
          nil
    end
  end

  def apply_delta(map, delta, direction) do
    # IO.puts("applying delta 1")
    # IO.inspect(delta)
    # IO.inspect(direction)
    # IO.puts("applying delta 2")
    if is_map(map) and is_map(delta) do
      delta = Map.delete(delta, "unix_ms")
      # Loop over keys in delta and apply the changes to the map
      Enum.reduce(delta, map, fn({k, v}, acc) ->
        if is_map(v) do
          put_in(acc[k], apply_delta(map[k], v, direction))
        else
          new_val = if direction == "undo" do
            Enum.at(v,0)
          else
            Enum.at(v,1)
          end
          if new_val == ":removed" do
            Map.delete(acc, k)
          else
            put_in(acc[k], new_val)
          end
        end
      end)
    else
      map
    end
  end

  def apply_delta_list(game, delta_list, direction) do
    Enum.reduce(delta_list, game, fn(delta, acc) ->
      apply_delta(acc, delta, direction)
    end)
  end

  def apply_deltas_until_round_change(gameui, direction) do
    deltas = gameui["deltas"]
    round_init = gameui["roundNumber"]
    Enum.reduce_while(deltas, gameui, fn(delta, acc) ->
      replay_step = acc["replayStep"]
      # Check if we run into the beginning/end
      cond do
        direction == "undo" and replay_step == 0 ->
          {:halt, acc}
        direction == "redo" and replay_step == Enum.count(deltas) ->
          {:halt, acc}
      # Check if round has changed
        acc["roundNumber"] != round_init ->
          {:halt, acc}
      # Otherwise continue
        true ->
          {:cont, step(acc, direction)}
      end
    end)
  end

  def get_player_n(gameui, user_id) do
    info = gameui["playerInfo"]
    if user_id == nil do
      nil
    else
      Enum.reduce_while(info, nil, fn {key, player_info}, acc ->
        if player_info != nil and player_info["id"] == user_id do
          {:halt, key}
        else
          {:cont, acc}
        end
      end)
    end
  end

  def get_alias_by_user_id(game, user_id) do
    game["playerInfo"]
    |> Enum.find(fn {_, player_info} -> player_info["id"] == user_id end)
    |> case do
      nil -> nil
      {_, player_info} -> player_info["alias"]
    end
  end

  def save_replay(game, user_id) do
    game_uuid = game["id"]
    game_def = Plugins.get_game_def(game["options"]["pluginId"])
    updates = %{
      rounds: game["roundNumber"],
      num_players: game["numPlayers"],
      game_json: game,
      description: Evaluate.evaluate(game, game_def["saveDescription"])
    }
    result =
      case Repo.get_by(Replay, [user_id: user_id, uuid: game_uuid]) do
        nil  -> %Replay{user_id: user_id, uuid: game_uuid} # Replay not found, we build one
        replay -> replay  # Replay exists, let's use it
      end
      |> Replay.changeset(updates)
      |> Repo.insert_or_update

    Evaluate.evaluate(game, ["LOG", "$PLAYER_N", " saved the game."])
  end

  def set_last_room_update(gameui) do
    if rem(Enum.count(gameui["deltas"]), 20) == 0 do
      timestamp = System.system_time(:second)
      room = Repo.get_by(Room, [slug: gameui["roomSlug"]])
      if room do
        updates = %{
          last_update: timestamp,
          name: gameui["game"]["roomName"],
          num_players: gameui["game"]["numPlayers"]
        }
        room
        |> Room.changeset(updates)
        |> Repo.insert_or_update
      end
    end
  end


  def step_through(gameui, options) do
    size = options["size"]
    direction = options["direction"]
    IO.puts("step_through 1")
    IO.inspect(Enum.count(gameui["deltas"]))
    IO.puts("step_through 2")

    cond do
      size == "single" ->
        step(gameui, direction)
      size == "round" ->
        apply_deltas_until_round_change(gameui, direction)
      true ->
        gameui
    end
  end

  def reset_game(game) do
    Game.new(game["options"])
  end

  def create_card_in_group(game, game_def, group_id, load_list_item) do
    IO.puts("create_card_in_group 1")
    IO.inspect(load_list_item)
    IO.inspect(group_id)
    group_size = Enum.count(get_stack_ids(game, group_id))
    IO.puts("create_card_in_group 2")
    # Can't insert a card directly into a group need to make a stack first
    new_card = Card.card_from_card_details(load_list_item["cardDetails"], game_def, load_list_item["uuid"], group_id)
    IO.puts("create_card_in_group 3")
    IO.inspect(new_card)
    new_stack = Stack.stack_from_card(new_card)
    new_card = new_card
    |> Map.put("groupId", group_id)
    |> Map.put("stackId", new_stack["id"])
    |> Map.put("stackIndex", group_size)
    |> Map.put("cardIndex", 0)

    IO.puts("new_card 2")
    IO.inspect(new_card)

    game = game
    |> insert_stack_in_group(group_id, new_stack["id"], group_size)
    |> update_stack(new_stack)
    |> update_card(new_card)
    |> implement_card_automations(game_def, new_card)
    |> update_card_state(new_card["id"], nil)
    game
  end

  def implement_card_automations(game, game_def, card) do
    card_automation = game_def["automation"][card["cardDbId"]]
    if card_automation == nil do
      game
    else
      game
      |> put_in(["automation", card["id"]], card_automation)
      |> put_in(["automation", card["id"], "this_id"], card["id"])
    end
  end

  # def tba() do
  #   if rule["type"] == "onChange" do
  #     dtc = define_this_card(card_id)
  #     val = %{
  #       "key" => dtc ++ [rule["key"]],
  #       "before" => dtc ++ [rule["before"]],
  #       "after" => dtc ++ [rule["after"]],
  #       "then" => dtc ++ [rule["then"]],
  #     }
  #     game = Evaluate.evaluate(game, define_this_card(card_id))
  #     path = Evaluate.evaluate(game, rule["path"])
  #     if Evaluate.evaluate(game, ["GAME_GET_VAL", path ++ ["_automate_"]]) do
  #       Evaluate.evaluate(game, ["SET"] ++ path ++ ["_automate_", card_id, val])
  #     else
  #       Evaluate.evaluate(game, ["SET"] ++ path ++ ["_automate_", %{card_id => val}])
  #     end
  #   end
  # end

  def load_card(game, game_def, load_list_item) do
    quantity = load_list_item["quantity"]

    game = if quantity <= 0 do
      game
    else
      group_id = load_list_item["loadGroupId"]

      1..quantity
      |> Enum.reduce(game, fn(_index, acc) ->
        create_card_in_group(acc, game_def, group_id, load_list_item)
      end)
    end
  end

  def shuffle_changed_decks(new_game, old_game, game_def) do
    new_game["groupById"]
    |> Enum.reduce(new_game, fn({group_id, group}, acc) ->
      old_stack_ids = get_stack_ids(old_game, group_id)
      new_stack_ids = get_stack_ids(new_game, group_id)
      # Check if the number of stacks in the deck has changed, and if so, we shuffle
      if group["shuffleOnLoad"] && length(old_stack_ids) != length(new_stack_ids) do
        acc = shuffle_group(acc, group_id)
        acc = Evaluate.evaluate(acc, ["LOG", "$PLAYER_N", " shuffled ", l10n(acc, game_def, group["label"]), "."])
      else
        acc
      end
    end)
  end

  def l10n(game, game_def, label) do
    # Check if label starts with "id:"
    text = if String.starts_with?(label, "id:") do
      label_id = String.slice(label, 3..-1)
      language = game["options"]["language"]
      case get_in(game_def["labels"][label_id], [language]) do
        nil -> label
        val -> val
      end
    else
      label
    end
  end

  def shuffle_group(gameui, group_id) do
    shuffled_stack_ids = get_stack_ids(gameui, group_id) |> Enum.shuffle
    update_stack_ids(gameui, group_id, shuffled_stack_ids)
  end

  def load_cards(game, player_n, load_list) do
    game_def = Plugins.get_game_def(game["options"]["pluginId"])

    old_game = game

    game = Enum.reduce(load_list, game, fn load_list_item, acc ->
      load_card(acc, game_def, load_list_item)
    end)

    game = Evaluate.evaluate(game, ["LOG", "$PLAYER_N", " loaded cards."])

    game = shuffle_changed_decks(game, old_game, game_def)


    # # Check if we should load the first quest card
    # main_quest_stack_ids = get_stack_ids(game, "sharedMainQuest")
    # IO.puts("load_cards 2a")
    # quest_deck_stack_ids = get_stack_ids(game, "sharedQuestDeck")
    # IO.puts("load_cards 2b")
    # game = if Enum.count(quest_deck_stack_ids)>0 && Enum.count(main_quest_stack_ids)==0 do
    #   IO.puts("load_cards 2c")
    #   # Dump nightmare/campaign cards into staging
    #   game = Enum.reduce_while(quest_deck_stack_ids, game, fn(stack_id, acc) ->
    #     card = get_top_card_of_stack(acc, stack_id)
    #     IO.puts("load_cards 2d")
    #     card_type = card["sides"]["A"]["type"]
    #     IO.puts("load_cards 2e")
    #     IO.inspect(card_type)
    #     case card_type do
    #       "Nightmare" ->
    #         {:cont, move_stack(acc, stack_id, "sharedStaging", 0)}
    #       "Campaign" ->
    #         {:cont, move_stack(acc, stack_id, "sharedStaging", 0)}
    #       "Quest" ->
    #         {:halt, move_stack(acc, stack_id, "sharedMainQuest", 0)}
    #       _ ->
    #         {:cont, acc}
    #     end
    #   end)
    # else
    #   game
    # end

    # IO.puts("load_cards 3")

    # # Update encounter name
    # game = put_in(game["roomTitle"], get_encounter_name(game))


    # IO.puts("load_cards 4")
    # # Calculate threat cost
    # threat = Enum.reduce(load_list, 0, fn(r, acc) ->
    #   sideA = r["cardRow"]["sides"]["A"]
    #   if sideA["type"] == "Hero" && r["groupId"] == player_n<>"Play1" && game["roundNumber"] == 0 do
    #     acc + CardFace.convert_to_integer(sideA["cost"])*r["quantity"]
    #   else
    #     acc
    #   end
    # end)
    # IO.puts("load_cards 5")
    # # Add to starting threat
    # current_threat = game["playerData"][player_n]["threat"]
    # game = put_in(game["playerData"][player_n]["threat"], current_threat + threat)

    # IO.puts("load_cards 6")
    # # If deck size has increased from 0, assume it is at start of game and a draw of 6 is needed
    # round_number = game["roundNumber"]
    # round_step = game["stepId"]
    # deck_size_after = Enum.count(get_stack_ids(game, player_n_deck_id))

    # IO.puts("load_cards 7")
    # # Shuffle decks with new cards
    # game = shuffle_changed_decks(old_game, game)

    # IO.puts("load_cards 8")
    # # Check if a hand needs to be drawn
    # game = if round_number == 0 && round_step == "0.0" && deck_size_before == 0 && deck_size_after > 6 do
    #   Enum.reduce(1..6, game, fn(i, acc) ->
    #     stack_ids = get_stack_ids(acc, player_n_deck_id)
    #     acc = move_stack(acc, Enum.at(stack_ids, 0), player_n<>"Hand", -1)
    #   end)
    # else
    #   game
    # end
  end

end
