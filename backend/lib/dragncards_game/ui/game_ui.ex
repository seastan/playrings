defmodule DragnCardsGame.GameUI do
  @moduledoc """
  One level on top of Game.
  """


  require Logger
  alias DragnCardsGame.{Game, GameUI, GameUISeat, Groups, Group, Stack, Card, User, Tokens, CardFace, Player}
  alias DragnCards.{Repo, Replay}
  alias DragnCards.Rooms.Room

  @type t :: Map.t()

  @spec new(String.t(), User.t(), Map.t()) :: GameUI.t()
  def new(game_name, user, %{} = options) do
    Logger.debug("game_ui new")
    gameui = %{
      "game" => Game.load(options),
      "gameName" => game_name,
      "options" => options,
      "created_at" => DateTime.utc_now(),
      "created_by" => user,
      "privacyType" => options["privacyType"],
      "playerIds" => %{
        "player1" => user,
        "player2" => nil,
        "player3" => nil,
        "player4" => nil,
      },
      "playersInRoom" => %{},
      "lastUpdate" => System.system_time(:second),
    }
  end

  def pretty_print(gameui, header \\ nil) do
    IO.puts(header)
    Enum.each(gameui["game"]["groupById"], fn({group_id, group}) ->
      stack_ids = get_stack_ids(gameui, group_id)
      stacks_size = Enum.count(stack_ids)
      if stacks_size > 0 do
        IO.puts(group["id"])
        Enum.each(stack_ids, fn(stack_id) ->
          IO.puts("  #{stack_id}")
          card_ids = get_card_ids(gameui, stack_id)
          Enum.each(Enum.with_index(card_ids), fn({card_id, index}) ->
            card = get_card(gameui, card_id)
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

  def get_group(gameui, group_id) do
    gameui["game"]["groupById"][group_id]
  end

  def get_group_controller(gameui, group_id) do
    group = get_group(gameui, group_id)
    if group do group["controller"] else nil end
  end

  def get_group_type(gameui, group_id) do
    group = get_group(gameui, group_id)
    if group do group["type"] else nil end
  end

  def get_stack_ids(gameui, group_id) do
    get_group(gameui,group_id)["stackIds"]
  end

  def get_stack(gameui, stack_id) do
    gameui["game"]["stackById"][stack_id]
  end

  def get_card_ids(gameui, stack_id) do
    get_stack(gameui, stack_id)["cardIds"]
  end

  def get_card(gameui, card_id) do
    gameui["game"]["cardById"][card_id]
  end

  def get_targeting(gameui, card_id) do
    get_card(gameui, card_id)["targeting"]
  end

  def get_tokens(gameui, card_id) do
    get_card(gameui, card_id)["tokens"]
  end

  def get_token(gameui, card_id, token_type) do
    get_tokens(gameui, card_id)[token_type]
  end

  def get_tokens_per_round(gameui, card_id) do
    get_card(gameui, card_id)["tokensPerRound"]
  end

  def get_token_per_round(gameui, card_id, token_type) do
    get_tokens_per_round(gameui, card_id)[token_type]
  end

  def get_current_card_face(gameui, card_id) do
    card = get_card(gameui, card_id)
    card["sides"][card["currentSide"]]
  end

  def get_group_by_stack_id(gameui, stack_id) do
    Enum.reduce(gameui["game"]["groupById"], nil, fn({group_id, group}, acc) ->
      acc = if stack_id in group["stackIds"] do group else acc end
    end)
  end

  def get_group_by_card_id(gameui, card_id) do
    stack = get_stack_by_card_id(gameui, card_id)
    get_group_by_stack_id(gameui, stack["id"])
  end

  def get_stack_index_by_stack_id(gameui, stack_id) do
    group_id = get_group_by_stack_id(gameui, stack_id)["id"]
    stack_ids = get_stack_ids(gameui, group_id)
    Enum.find_index(stack_ids, fn id -> id == stack_id end)
  end

  def get_stack_by_card_id(gameui, card_id) do
    Enum.reduce(gameui["game"]["stackById"], nil, fn({stack_id, stack}, acc) ->
      acc = if card_id in stack["cardIds"] do stack else acc end
    end)
  end

  def get_stack_by_index(gameui, group_id, stack_index) do
    stack_ids = gameui["game"]["groupById"][group_id]["stackIds"]
    gameui["game"]["stackById"][Enum.at(stack_ids, stack_index)]
  end

  def get_card_index_by_card_id(gameui, card_id) do
    stack_id = get_stack_by_card_id(gameui, card_id)["id"]
    card_ids = get_card_ids(gameui, stack_id)
    Enum.find_index(card_ids, fn id -> id == card_id end)
  end

  def gsc(gameui, card_id) do
    stack = get_stack_by_card_id(gameui, card_id)
    stack_id = stack["id"]
    card_index = get_card_index_by_card_id(gameui, card_id)
    stack_index = get_stack_index_by_stack_id(gameui, stack_id)
    group_id = get_group_by_stack_id(gameui, stack_id)["id"]
    {group_id, stack_index, card_index}
  end

  def get_card_by_gsc(gameui, gsc) do
    group_id = Enum.at(gsc,0)
    stack_index = Enum.at(gsc,1)
    card_index = Enum.at(gsc,2)
    group = get_group(gameui, group_id)
    stack_ids = group["stackIds"]
    if Enum.count(stack_ids) <= stack_index do
      nil
    else
      stack = get_stack(gameui, Enum.at(stack_ids, stack_index))
      card_ids = stack["cardIds"]
      if Enum.count(card_ids) <= card_index do
        nil
      else
        get_card(gameui, Enum.at(card_ids, card_index))
      end
    end
  end

  ############################################################
  # Updaters                                                 #
  ############################################################

  def update_group(gameui, new_group) do
    put_in(gameui["game"]["groupById"][new_group["id"]], new_group)
  end

  def update_stack_ids(gameui, group_id, new_stack_ids) do
    put_in(gameui["game"]["groupById"][group_id]["stackIds"], new_stack_ids)
  end

  def update_stack(gameui, new_stack) do
    put_in(gameui["game"]["stackById"][new_stack["id"]], new_stack)
  end

  def update_card_ids(gameui, stack_id, new_card_ids) do
    put_in(gameui["game"]["stackById"][stack_id]["cardIds"], new_card_ids)
  end

  def update_card(gameui, new_card) do
    put_in(gameui["game"]["cardById"][new_card["id"]], new_card)
  end

  def update_targeting(gameui, card_id, new_targeting) do
    put_in(gameui["game"]["cardById"][card_id]["targeting"], new_targeting)
  end

  def update_tokens(gameui, card_id, new_tokens) do
    put_in(gameui["game"]["cardById"][card_id]["tokens"], new_tokens)
  end

  def update_token(gameui, card_id, token_type, new_value) do
    put_in(gameui["game"]["cardById"][card_id]["tokens"][token_type], new_value)
  end


  ############################################################
  # Card actions                                             #
  ############################################################
  def card_action(gameui, card_id, action, options) do
    Logger.debug("card_action #{action}")
    Logger.debug(options)
    card = get_card(gameui, card_id)
    gameui = case action do
      "update_card_values" ->
        update_card_values(gameui, card_id, options["updates"])
      "increment_token" ->
        increment_token(gameui, card_id, options["token_type"], options["increment"])
      "apply_tokens_per_round" ->
        apply_tokens_per_round(gameui, card_id)
      "delete_card" ->
        delete_card(gameui, card_id)
      "flip_card" ->
        flip_card(gameui, card_id)
      "discard_card" ->
        discard_card(gameui, card_id)
      "add_trigger" ->
        add_trigger(gameui, card_id, options["round_step"])
      "remove_trigger" ->
        remove_trigger(gameui, card_id, options["round_step"])
      _ ->
        gameui
    end
  end

  # Discard a card
  def discard_card(gameui, card_id) do
    card = get_card(gameui, card_id)
    move_card(gameui, card_id, card["discardGroupId"], 0, 0, false, false)
  end

  # Update a single card parameter
  def update_card_value(gameui, card_id, update) do
    update_value(gameui, ["game", "cardById", card_id] ++ update)
  end

  # Update multiple parameters of a card
  def update_card_values(gameui, card_id, updates) do
    Enum.reduce(updates, gameui, fn(update, acc) ->
      acc = update_card_value(acc, card_id, update)
    end)
  end

  # Add tokens per round to card
  def apply_tokens_per_round(gameui, card_id) do
    tokens_per_round = get_tokens_per_round(gameui, card_id)
    Enum.reduce(tokens_per_round, gameui, fn({token_type, increment}, acc) ->
      acc = increment_token(acc, card_id, token_type, increment)
    end)
  end

  # Move a card
  def move_card(gameui, card_id, dest_group_id, dest_stack_index, dest_card_index, combine, preserve_state) do
    # Get position of card
    {orig_group_id, orig_stack_index, orig_card_index} = gsc(gameui, card_id)
    # Get origin stack
    orig_stack = get_stack_by_index(gameui, orig_group_id, orig_stack_index)
    # Perpare destination stack
    gameui = if combine do
      gameui
    else
      new_stack = Stack.empty_stack()
      insert_new_stack(gameui, dest_group_id, dest_stack_index, new_stack)
    end
    # Get destination stack
    dest_stack = get_stack_by_index(gameui, dest_group_id, dest_stack_index)
    # Update gameui
    gameui
    |> remove_from_stack(card_id)
    |> add_to_stack(dest_stack["id"], card_id, dest_card_index)
    |> update_card_state(card_id, preserve_state, orig_group_id)
  end

  # Increment a token
  def increment_token(gameui, card_id, token_type, increment) do
    old_value = get_token(gameui, card_id, token_type)
    new_value = if old_value + increment < 0 && Enum.member?(["resource", "progress", "damage", "time"], token_type) do
      0
    else
      old_value + increment
    end
    update_token(gameui, card_id, token_type, new_value)
  end

  # Increment multiple tokens
  def increment_token(gameui, card_id, token_increments) do
    Enum.reduce(token_increments, gameui, fn({k,v}, acc) ->
      acc = increment_token(acc, card_id, k, v)
    end)
  end

  # Increment tokens for a list of card ids
  def increment_tokens_object(gameui, increment_object) do
    Enum.reduce(increment_object, gameui, fn({k,v}, acc) ->
      acc = increment_token(acc, k, v)
    end)
  end

  def target_card_ids(gameui, card_ids, player_n) do
    Enum.reduce(card_ids, gameui, fn(card_id, acc) ->
      old_targeting = get_targeting(acc, card_id)
        acc = if old_targeting do
          new_targeting = put_in(old_targeting[player_n], true)
          update_targeting(acc, card_id, new_targeting)
        else
          acc
        end
    end)
  end

  # Exhaust/ready a card
  def toggle_exhaust(gameui, card_id) do
    card = get_card(gameui, card_id)
    new_card = if card["exhausted"] do
      card = put_in(card["exhausted"], false)
      put_in(card["rotation"], 0)
    else
      card = put_in(card["exhausted"], true)
      put_in(card["rotation"], 90)
    end
    update_card(gameui, new_card)
  end

  # Flip a card
  def flip_card(gameui, card_id) do
    {group_id, stack_index, card_index} = gsc(gameui, card_id)
    group_type = get_group_type(gameui, group_id)
    # If in play, remove triggers
    gameui = if group_type === "play" do
      remove_triggers(gameui, card_id)
    else
      gameui
    end
    # Flip card
    old_card = get_card(gameui, card_id)
    current_side = old_card["currentSide"]
    new_card = if current_side == "A" do
      put_in(old_card["currentSide"],"B")
    else
      put_in(old_card["currentSide"],"A")
    end
    gameui = update_card(gameui, new_card)
    # If in play, add triggers
    if group_type === "play" do
      add_triggers(gameui, card_id)
    else
      gameui
    end
  end

  # Deal a shadow card
  def deal_shadow(gameui, card_id) do
    {group_id, stack_index, card_index} = gsc(gameui, card_id)
    stack = get_stack_by_card_id(gameui, card_id)
    shadow_card = get_card_by_gsc(gameui, ["sharedEncounterDeck", 0, 0])
    if shadow_card do
      cards_size = Enum.count(stack["cardIds"])
      gameui = move_card(gameui, shadow_card["id"], group_id, stack_index, cards_size, true, true)
      rotated_shadow_card = put_in(shadow_card["rotation"], -30)
      update_card(gameui, rotated_shadow_card)
    else
      gameui
    end
  end

  # Detach a card
  def detach(gameui, card_id) do
    card = get_card(gameui, card_id)
    # If it's rotated and not exhausted, it's a shadow card, so when we detach it we want to set its rotation to 0.
    card = if card["exhausted"] == false && card["rotation"] != 0 do
      put_in(card["rotation"], 0)
    else
      card
    end
    gameui = update_card(gameui, card)
    # Get position of card and move it next to the initial stack
    {group_id, stack_index, card_index} = gsc(gameui, card_id)
    move_card(gameui, card_id, group_id, stack_index + 1, 0, false, true)
  end

  def discard_group_id_for_deck_group_id(deck_group_id) do
    case deck_group_id do
      "player1Deck" ->
        "player1Discard"
      "player1Deck2" ->
        "player1Discard"
      "player2Deck" ->
        "player2Discard"
      "player2Deck2" ->
        "player2Discard"
      "player3Deck" ->
        "player3Discard"
      "player3Deck2" ->
        "player3Discard"
      "player4Deck" ->
        "player4Discard"
      "player4Deck2" ->
        "player4Discard"
      "sharedEncounterDeck" ->
        "sharedEncounterDiscard"
      "sharedEncounterDeck2" ->
        "sharedEncounterDiscard2"
      "sharedEncounterDeck3" ->
        "sharedEncounterDiscard3"
      "sharedQuestDeck" ->
        "sharedQuestDiscard"
      "sharedQuestDeck2" ->
        "sharedQuestDiscard2"
      _ ->
        "sharedEncounterDiscard"
    end
  end

  # Update a card state
  # Modify the card orientation/tokens based on where it is now
  def update_card_state(gameui, card_id, preserve_state, orig_group_id) do
    if preserve_state do
      # We still remove arrows
      #card = put_in(card["arrowIds"], [])
      #update_card(gameui, card)
      gameui
    else
      card = get_card(gameui, card_id)
      card_name = card["sides"]["A"]["name"]
      card_face = get_current_card_face(gameui, card_id)
      dest_group = get_group_by_card_id(gameui, card_id)
      dest_group_id = dest_group["id"]
      orig_group_type = get_group_type(gameui, orig_group_id)
      dest_group_type = get_group_type(gameui, dest_group_id)
      committed_willpower = if card["committed"] do
        card_face["willpower"] + card["tokens"]["willpower"]
      else
        0
      end
      old_controller = card["controller"]
      new_controller = dest_group["controller"]
      # Remove arrows
      #card = put_in(card["arrowIds"], [])
      # Set new controller
      card = put_in(card["controller"], new_controller)
      # Entering play
      card = if dest_group_type == "play" and orig_group_type != "play" do
        card
        |> Map.put("roundEnteredPlay", gameui["game"]["round"])
        |> Map.put("phaseEnteredPlay", gameui["game"]["phase"])
      else card end
      # Leaving player control
      card = if old_controller !== "shared" and new_controller == "shared" do
        card
        |> Map.put("committed", false)
      else card end
      # Leaving play
      card = if dest_group_type != "play" do
        card
        |> Map.put("tokens", Tokens.new())
        |> Map.put("tokensPerRound", Tokens.new())
        |> Map.put("exhausted", false)
        |> Map.put("rotation", 0)
        |> Map.put("committed", false)
        |> Map.put("roundEnteredPlay", nil)
        |> Map.put("phaseEnteredPlay", nil)
        |> clear_targets()
      else card end
      # Entering deck: flip card facedown, no peeking
      card = if dest_group_type == "deck" do
        new_deck_id = dest_group_id
        new_discard_id = discard_group_id_for_deck_group_id(new_deck_id)
        card
        |> Map.put("currentSide", "B")
        |> Map.put("owner", new_controller)
        |> Map.put("deckGroupId", new_deck_id)
        |> Map.put("discardGroupId", new_discard_id)
        |> set_all_peeking(false)
      else card end
      # Entering discard: flip card faceup, no peeking
      card = if dest_group_type == "discard" do
        card
        |> Map.put("currentSide", "A")
        |> set_all_peeking(false)
      else card end
      # Leaving hand/deck: flip card faceup
      card = if (orig_group_type == "deck" or orig_group_type =="hand") and dest_group_type != "deck" and dest_group_type != "hand" do
        flipped_card = Map.put(card, "currentSide", "A")
        set_all_peeking(flipped_card, false)
      else card end
      # Entering hand: flip facedown and only controller can peek
      card = if dest_group_type == "hand" do
        card = Map.put(card, "currentSide", "B")
        card = set_all_peeking(card, false)
        controller = get_group_controller(gameui, dest_group_id)
        put_in(card["peeking"][controller], true)
      else card end
      # Entering hand that is visible. Set all peeking to true
      card = if dest_group_type == "hand" and gameui["game"]["playerData"][dest_group["controller"]]["visibleHand"] do
        card = set_all_peeking(card, true)
      else
        card
      end
      gameui = update_card(gameui, card)
      # Update game based on card moving
      # Handle triggers
      gameui = if dest_group_type == "play" do
        add_triggers_card_face(gameui, card_id, card_face)
      else
        remove_triggers_card_face(gameui, card_id, card_face)
      end
      # Handle committed willpower leaving play
      gameui = if committed_willpower > 0 and dest_group_type !== "play" and old_controller !== "shared" do
        old_controller_willpower = gameui["game"]["playerData"][old_controller]["willpower"]
        put_in(gameui["game"]["playerData"][old_controller]["willpower"], old_controller_willpower - committed_willpower)
      else
        gameui
      end
      # Handle committed willpower changing control
      gameui = if committed_willpower > 0 and old_controller !== new_controller and old_controller !== "shared" do
        old_controller_willpower = gameui["game"]["playerData"][old_controller]["willpower"]
        gameui = put_in(gameui["game"]["playerData"][old_controller]["willpower"], old_controller_willpower - committed_willpower)
        if new_controller !== "shared" do
          new_controller_willpower = gameui["game"]["playerData"][new_controller]["willpower"]
          put_in(gameui["game"]["playerData"][new_controller]["willpower"], new_controller_willpower + committed_willpower)
        else
          gameui
        end
      else
        gameui
      end
    end
  end

  # Delete card from game
  def delete_card(gameui, card_id) do
    gameui
    |> delete_card_from_card_by_id(card_id)
    |> remove_from_stack(card_id)
  end

  def delete_card_from_card_by_id(gameui, card_id) do
    old_card_by_id = gameui["game"]["cardById"]
    new_card_by_id = Map.delete(old_card_by_id, card_id)
    put_in(gameui["game"]["cardById"], new_card_by_id)
  end

  # Removes a card from a stack, but is stays in cardById
  def remove_from_stack(gameui, card_id) do
    stack_id = get_stack_by_card_id(gameui, card_id)["id"]
    old_card_ids = get_card_ids(gameui, stack_id)
    card_index = get_card_index_by_card_id(gameui, card_id)
    new_card_ids = List.delete_at(old_card_ids, card_index)
    if Enum.count(new_card_ids) == 0 do
      delete_stack(gameui, stack_id)
    else
      update_card_ids(gameui, stack_id, new_card_ids)
    end
  end

  def peek_card(gameui, player_n, card_id, value) do
    card = get_card(gameui, card_id)
    card = if card["currentSide"] == "B" do # Only peek if card is facedown
      if player_n == "all" do
        set_all_peeking(card, value)
      else
        put_in(card["peeking"][player_n], value)
      end
    else
      card
    end
    update_card(gameui, card)
  end

  def add_trigger(gameui, card_id, round_step) do
    old_round_step_triggers = gameui["game"]["triggerMap"][round_step]
    if old_round_step_triggers && Enum.member?(old_round_step_triggers, card_id) do
      gameui
    else
      new_round_step_triggers = if old_round_step_triggers do
        old_round_step_triggers ++ [card_id]
      else
        [card_id]
      end
      put_in(gameui["game"]["triggerMap"][round_step], new_round_step_triggers)
    end
  end

  def add_triggers(gameui, card_id) do
    card_face = get_current_card_face(gameui, card_id)
    add_triggers_card_face(gameui, card_id, card_face)
  end

  def add_triggers_card_face(gameui, card_id, card_face) do
    card_triggers = card_face["triggers"]
    Enum.reduce(card_triggers, gameui, fn(round_step, acc) ->
      acc = add_trigger(acc, card_id, round_step)
    end)
  end

  def remove_trigger(gameui, card_id, round_step) do
    old_round_step_triggers = gameui["game"]["triggerMap"][round_step]
    if old_round_step_triggers && Enum.member?(old_round_step_triggers, card_id) do
      put_in(gameui["game"]["triggerMap"][round_step], Enum.reject(old_round_step_triggers, &(&1 == card_id)))
    else
      gameui
    end
  end

  def remove_triggers(gameui, card_id) do
    card_face = get_current_card_face(gameui, card_id)
    remove_triggers_card_face(gameui, card_id, card_face)
  end

  def remove_triggers_card_face(gameui, card_id, card_face) do
    card_triggers = card_face["triggers"]
    Enum.reduce(card_triggers, gameui, fn(round_step, acc) ->
      acc = remove_trigger(acc, card_id, round_step)
    end)
  end

  ### Card helper functions

  # Clear all targets from card
  def clear_targets(card) do
    new_targeting = %{
      "player1" => false,
      "player2" => false,
      "player3" => false,
      "player4" => false,
    }
    put_in(card["targeting"], new_targeting)
  end

  # Obtain a value from card based on cardpath
  def get_value_from_cardpath(card, cardpath) do
    Enum.reduce(cardpath, card, fn(entry, acc) ->
      entry = if entry == "sideUp" do
        card["currentSide"]
      else
        entry
      end
      entry = if entry == "sideDown" do
        if card["currentSide"] == "A" do
          "B"
        else
          "A"
        end
      else
        entry
      end
      acc = acc[entry]
    end)
  end

  def opposite_side(side) do
    if side == "A" do
      "B"
    else
      "A"
    end
  end

  def passes_criterion(card, obj, criterion) do
    case Enum.count(criterion) do
      0 ->
        false
      1 ->
        value = Enum.at(criterion, 0)
        obj == value
      _ ->
        property = Enum.at(criterion,0)
        property = case property do
          "sideUp" ->
            card["currentSide"]
          "sideDown" ->
            opposite_side(card["currentSide"])
          _ ->
            property
        end
        passes_criterion(card, obj[property], List.delete_at(criterion, 0))
    end
  end

  def passes_criteria(card, criteria) do
    Enum.reduce_while(criteria, true, fn(criterion, acc) ->
      if passes_criterion(card, card, criterion) do
        {:cont, true}
      else
        {:halt, false}
      end
    end)
  end

  def set_all_peeking(card, value) do
    Map.put(card, "peeking", %{
      "player1" => value,
      "player2" => value,
      "player3" => value,
      "player4" => value
    })
  end

  #################################################################
  # Stack actions                                                 #
  #################################################################

  def peek_stack(gameui, stack_id, player_n, value) do
    card_ids = get_card_ids(gameui, stack_id)
    Enum.reduce(card_ids, gameui, fn(card_id, acc) ->
      card = get_card(gameui, card_id)
      acc = peek_card(acc, player_n, card_id, value)
    end)
  end

  def peek_at(gameui, stack_ids, player_n, value) do
    Enum.reduce(stack_ids, gameui, fn(stack_id, acc) ->
      acc = peek_stack(acc, stack_id, player_n, value)
    end)
  end

  def set_stack_ids_peeking_all(gameui, stack_ids, value) do
    Enum.reduce(["player1" ,"player2", "player3", "player4"], gameui, fn(player_n, acc) ->
      peek_at(acc, stack_ids, player_n, value)
    end)
  end

  def get_top_card_of_stack(gameui, stack_id) do
    stack = get_stack(gameui, stack_id)
    card_id = Enum.at(stack["cardIds"],0)
    get_card(gameui, card_id)
  end


  def target_stack(gameui, player_n, stack_id) do
    card_ids = get_card_ids(gameui, stack_id)
    card_id = Enum.at(card_ids, 0)
    old_targeting = get_targeting(gameui, card_id)
    new_targeting = put_in(old_targeting[player_n], true)
    update_targeting(gameui, card_id, new_targeting)
  end

  def delete_stack(gameui, stack_id) do
    gameui
    |> delete_stack_from_stack_by_id(stack_id)
    |> delete_stack_id_from_group_by_id(stack_id)
  end

  def delete_stack_from_stack_by_id(gameui, stack_id) do
    old_stack_by_id = gameui["game"]["stackById"]
    new_stack_by_id = Map.delete(old_stack_by_id, stack_id)
    put_in(gameui["game"]["stackById"], new_stack_by_id)
  end

  def delete_stack_id_from_group_by_id(gameui, stack_id) do
    old_group = get_group_by_stack_id(gameui, stack_id)
    old_stack_ids = old_group["stackIds"]
    stack_index = get_stack_index_by_stack_id(gameui, stack_id)
    new_stack_ids = List.delete_at(old_stack_ids, stack_index)
    update_stack_ids(gameui, old_group["id"], new_stack_ids)
  end

  def add_to_stack(gameui, stack_id, card_id, card_index) do
    old_card_ids = get_card_ids(gameui, stack_id)
    new_card_ids = List.insert_at(old_card_ids, card_index, card_id)
    update_card_ids(gameui, stack_id, new_card_ids)
  end

  def update_stack_state(gameui, stack_id, options) do
    preserve_state = Enum.at(options, 0)
    orig_group_id = Enum.at(options, 1)
    if preserve_state do
      gameui
    else
      # Update cards in stack one at a time in reverse order
      # This is so that when the stack is removed from play,
      # order is preserved as cards are detached
      stack = get_stack(gameui, stack_id)
      dest_group = get_group_by_stack_id(gameui, stack_id)
      dest_group_id = dest_group["id"]
      card_ids = get_card_ids(gameui, stack_id)
      gameui = Enum.reduce(card_ids, gameui, fn(card_id, acc) ->
        acc = update_card_state(acc, card_id, preserve_state, orig_group_id)
      end)
      # If a stack is out of play, we need to split it up
      if Enum.count(card_ids)>1 && get_group_type(gameui, dest_group_id) != "play" do
        reverse_card_ids = Enum.reverse(card_ids)
        Enum.reduce(reverse_card_ids, gameui, fn(card_id, acc) ->
          acc = detach(acc, card_id)
        end)
      else
        gameui
      end
    end
  end

  def move_stack(gameui, stack_id, dest_group_id, dest_stack_index, combine \\ false, preserve_state \\ false) do
    orig_group_id = get_group_by_stack_id(gameui, stack_id)["id"]
    orig_stack_index = get_stack_index_by_stack_id(gameui, stack_id)
    # If destination is negative, count backward from the end
    dest_stack_index = if dest_stack_index < 0 do
      loop_index = Enum.count(GameUI.get_stack_ids(gameui, dest_group_id)) + dest_stack_index
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
    old_orig_stack_ids = get_stack_ids(gameui, orig_group_id)
    new_orig_stack_ids = List.delete_at(old_orig_stack_ids, orig_stack_index)
    gameui = update_stack_ids(gameui, orig_group_id, new_orig_stack_ids)
    # Add to new position
    gameui = if combine do
      # Get existing destination stack
      dest_stack = get_stack_by_index(gameui, dest_group_id, dest_stack_index)
      dest_stack_id = dest_stack["id"]
      # Update card ids of destination stack
      old_orig_card_ids = get_card_ids(gameui, stack_id)
      old_dest_card_ids = get_card_ids(gameui, dest_stack["id"])
      new_dest_card_ids = old_dest_card_ids ++ old_orig_card_ids
      gameui = update_card_ids(gameui, dest_stack_id, new_dest_card_ids)
      # Delete original stack
      gameui = delete_stack_from_stack_by_id(gameui, stack_id)
      gameui = update_stack_state(gameui, dest_stack_id, [preserve_state, orig_group_id])
    else
      # Update destination group stack ids
      old_dest_stack_ids = get_stack_ids(gameui, dest_group_id)
      new_dest_stack_ids = List.insert_at(old_dest_stack_ids, dest_stack_index, stack_id)
      gameui = update_stack_ids(gameui, dest_group_id, new_dest_stack_ids)
      |> update_stack_state(stack_id, [preserve_state, orig_group_id])
    end
  end

  def move_stacks(gameui, orig_group_id, dest_group_id, top_n, position) do
    orig_stack_ids = get_stack_ids(gameui, orig_group_id)
    # Moving stacks to the top or the bottom of the new group?
    dest_stack_index = if position == "bottom" do -1 else 0 end
    # Move stacks 1 at a time
    gameui = Enum.reduce(Enum.with_index(orig_stack_ids), gameui, fn({stack_id, index}, acc) ->
      if index < top_n do
        move_stack(acc, stack_id, dest_group_id, dest_stack_index)
      else
        acc
      end
    end)
    # Do we shuffle it in?
    if position == "shuffle" do shuffle_group(gameui, dest_group_id) else gameui end
  end

  def insert_card_in_stack(gameui, stack_id, card_id, index) do
    old_card_ids = gameui["game"]["stackById"][stack_id]["cardIds"]
    new_card_ids = List.insert_at(old_card_ids, index, card_id)
    update_card_ids(gameui, stack_id, new_card_ids)
  end

  #################################################################
  # Group actions                                                 #
  #################################################################

  def insert_new_stack(gameui, group_id, stack_index, stack) do
    old_stack_ids = get_stack_ids(gameui, group_id)
    new_stack_ids = List.insert_at(old_stack_ids, stack_index, stack["id"])
    gameui
    |> update_stack(stack)
    |> update_stack_ids(group_id, new_stack_ids)
  end

  def insert_stack_in_group(gameui, group_id, stack_id, index) do
    old_stack_ids = get_stack_ids(gameui, group_id)
    new_stack_ids = List.insert_at(old_stack_ids, index, stack_id)
    update_stack_ids(gameui, group_id, new_stack_ids)
  end

  def deal_x(gameui, group_id, dest_group_id, top_x) do
    stack_ids = get_stack_ids(gameui, group_id)
    top_x = if Enum.count(stack_ids) < top_x do Enum.count(stack_ids) else top_x end
    top_x_stack_ids = Enum.slice(stack_ids, 0, top_x)
    gameui = set_stack_ids_peeking_all(gameui, stack_ids, false)
    gameui = if top_x > 0 do
      move_stack(gameui, Enum.at(top_x_stack_ids,0), dest_group_id, -1, false, true)
    else
      gameui
    end
    gameui = if top_x > 1 do
      Enum.reduce(1..(top_x-1), gameui, fn(index, acc) ->
        move_stack(acc, Enum.at(top_x_stack_ids,index), dest_group_id, -1, true, true)
      end)
    else
      gameui
    end
  end

  ################################################################
  # Game actions                                                 #
  ################################################################
  def game_action(gameui, user_id, action, options) do
    player_n = get_player_n(gameui, user_id)
    player_n = if options["for_player_n"] do options["for_player_n"] else player_n end
    Logger.debug("game_action #{user_id} #{player_n} #{action}")
    game_old = gameui["game"]
    gameui = if player_n do
      case action do
        "draw_card" ->
          draw_card(gameui, options["player_n"])
        "peek_at" ->
          peek_at(gameui, options["stack_ids"], player_n, options["value"])
        "peek_card" ->
          peek_card(gameui, player_n, options["card_id"], options["value"])
        "flip_card" ->
          flip_card(gameui, options["card_id"])
        "move_card" ->
          move_card(gameui, options["card_id"], options["dest_group_id"], options["dest_stack_index"], options["dest_card_index"], options["combine"], options["preserve_state"])
        "target_stack" ->
          target_stack(gameui, player_n, options["stack_id"])
        "move_stack" ->
          move_stack(gameui, options["stack_id"], options["dest_group_id"], options["dest_stack_index"], options["combine"], options["preserve_state"])
        "move_stacks" ->
          move_stacks(gameui, options["orig_group_id"], options["dest_group_id"], options["top_n"], options["position"])
        "shuffle_group" ->
          shuffle_group(gameui, options["group_id"])
        "detach" ->
          detach(gameui, options["card_id"])
        "set_game" ->
          put_in(gameui["game"], options["game"])
        "update_values" ->
          update_values(gameui, options["updates"])
        "action_on_matching_cards" ->
          action_on_matching_cards(gameui, options["criteria"], options["action"], options["options"])
        "deal_shadow" ->
          deal_shadow(gameui, options["card_id"])
        "deal_all_shadows" ->
          deal_all_shadows(gameui)
        "increment_threat" ->
          increment_threat(gameui, player_n, options["increment"])
        "increment_willpower" ->
          increment_willpower(gameui, player_n, options["increment"])
        "increment_token" ->
          increment_token(gameui, options["card_id"], options["token_type"], options["increment"])
        "increment_tokens" ->
          increment_token(gameui, options["card_id"], options["token_increments"])
        "increment_tokens_object" ->
          increment_tokens_object(gameui, options["increment_object"])
        "reset_game" ->
          reset_game(gameui)
        "load_cards" ->
          load_cards(gameui, player_n, options["load_list"])
        "set_seat" ->
          set_seat(gameui, options["user_id"], options["player_n"])
        "target_card_ids" ->
          target_card_ids(gameui, options["card_ids"], player_n)
        "step_through" ->
          step_through(gameui, options["size"], options["direction"])
        "save_replay" ->
          save_replay(gameui, user_id)
        "card_action" ->
          card_action(gameui, options["card_id"], options["action"], options["options"])
        "deal_x" ->
          deal_x(gameui, options["group_id"], options["dest_group_id"], options["top_x"])
        _ ->
          gameui
      end
    else
      case action do
        "set_seat" ->
          set_seat(gameui, options["user_id"], options["player_n"])
          _ ->
            gameui
      end
    end
    # Compare state before and after, and add a delta (unless we are undoing a move or loading a game with undo info)
    game_new = gameui["game"]
    gameui = if options["preserve_undo"] != true do
      game_new = Game.add_delta(game_new, game_old)
      gameui = put_in(gameui["game"], game_new)
      put_in(gameui["game"]["replayLength"], Enum.count(gameui["game"]["deltas"]))
    else
      gameui
    end
    gameui = set_last_update(gameui)
    gameui
  end

  def get_hero_list(gameui, player_n) do
    criteria = [["sides","A","type","Hero"], ["owner",player_n], ["groupType","play"]]
    heroes_in_play = get_cards_matching_criteria(gameui, criteria)
    criteria = [["sides","A","type","Hero"], ["owner",player_n], ["groupId", player_n<>"Discard"]]
    heroes_in_discard = get_cards_matching_criteria(gameui, criteria)
    heroes_in_play ++ heroes_in_discard
  end

  def get_hero_names(gameui, player_n) do
    hero_list = get_hero_list(gameui, player_n)
    Enum.reduce(hero_list, [], fn(hero, acc) ->
      acc ++ [hero["sides"]["A"]["name"]]
    end)
  end

  def get_encounter_name(gameui) do
    criteria = [["sides","A","cost",1], ["sides","A","type","Quest"]]
    card_1As = get_cards_matching_criteria(gameui, criteria)
    if Enum.count(card_1As) > 0 do
      # Pick the first quest 1A found
      card_1A = Enum.at(card_1As, 0)
      encounter_name = card_1A["cardEncounterSet"]
      criteria = [["sides","A","type","Nightmare"]]
      card_nightmare = get_cards_matching_criteria(gameui, criteria)
      encounter_name = if Enum.count(card_nightmare) > 0 do
        encounter_name <> " - Nightmare"
      else
        encounter_name
      end
    else
      ""
    end
  end

  def save_replay(gameui, user_id) do
    game_uuid = gameui["game"]["id"]
    num_players = gameui["game"]["numPlayers"]
    hero_1_names = get_hero_names(gameui, "player1")
    hero_2_names = get_hero_names(gameui, "player2")
    hero_3_names = get_hero_names(gameui, "player3")
    hero_4_names = get_hero_names(gameui, "player4")
    encounter_name = get_encounter_name(gameui)
    updates = %{
      encounter: encounter_name,
      rounds: gameui["game"]["roundNumber"],
      num_players: gameui["game"]["numPlayers"],
      player1_heroes: hero_1_names,
      player2_heroes: hero_2_names,
      player3_heroes: hero_3_names,
      player4_heroes: hero_4_names,
      game_json: gameui["game"],
    }
    result =
      case Repo.get_by(Replay, [user: user_id, uuid: game_uuid]) do
        nil  -> %Replay{user: user_id, uuid: game_uuid} # Replay not found, we build one
        replay -> replay  # Replay exists, let's use it
      end
      |> Replay.changeset(updates)
      |> Repo.insert_or_update
    gameui
  end

  def set_last_update(gameui) do
    timestamp = System.system_time(:second)
    room = Repo.get_by(Room, [slug: gameui["gameName"]])
    if room do
      updates = %{last_update: timestamp}
      room
      |> Room.changeset(updates)
      |> Repo.insert_or_update
    end
    put_in(gameui["lastUpdate"], timestamp)
  end

  def step_through(gameui, size, direction) do
    game_old = gameui["game"]
    game_new = cond do
      size == "single" ->
        Game.step(game_old, direction)
      size == "round" ->
        Game.apply_deltas_until_round_change(game_old, direction)
      true ->
        game_old
    end
    put_in(gameui["game"], game_new)
  end

  def draw_card(gameui, player_n) do
    stack_ids = get_stack_ids(gameui, player_n<>"Deck")
    if Enum.count(stack_ids) > 0 do
      move_stack(gameui, Enum.at(stack_ids, 0), player_n<>"Hand", -1)
    else
      gameui
    end
  end

  def set_seat(gameui, user_id, player_n) do
    put_in(gameui["playerIds"][player_n], user_id)
  end

  def increment_threat(gameui, player_n, increment) do
    current_threat = gameui["game"]["playerData"][player_n]["threat"]
    put_in(gameui["game"]["playerData"][player_n]["threat"], current_threat + increment)
  end

  def reset_game(gameui) do
    new_game = Game.new(gameui["game"]["options"])
    put_in(gameui["game"], new_game)
  end

  def reveal_encounter(gameui, player_n, options) do
    stack_ids = get_stack_ids(gameui, "sharedEncounter")
    if Enum.count(stack_ids) > 0 do
      move_stack(gameui, Enum.at(stack_ids, 0), "sharedStaging", -1)
    else
      gameui
    end
  end

  def rotate_list_left(list) do
    nl = if Enum.count(list) > 0 do
      Enum.slice(list, 1, Enum.count(list)) ++ [Enum.at(list,0)]
    else
      []
    end
  end

  def get_non_eliminated_players(gameui) do
    Enum.reduce(1..gameui["game"]["numPlayers"], [], fn(n, acc) ->
      player_n = "player"<>Integer.to_string(n)
      acc = if gameui["game"]["playerData"][player_n]["eliminated"] do
        acc
      else
        acc ++ [player_n]
      end
    end)
  end

  def get_player_order(gameui) do
    # Get list of non-eliminated players
    players = get_non_eliminated_players(gameui)
    # Rotate list until first player is first
    Enum.reduce_while(players, players, fn(player_n, acc) ->
      if gameui["game"]["firstPlayer"] == Enum.at(acc, 0) do
        {:halt, acc}
      else
        {:cont, rotate_list_left(acc)}
      end
    end)
  end

  def deal_player_n_shadows(gameui, player_n) do
    # Get engaged enemy cards
    criteria = [["groupId", player_n<>"Engaged"], ["cardIndex", 0], ["sides", "sideUp", "type", "Enemy"]]
    engaged_enemy_cards = get_cards_matching_criteria(gameui, criteria)
    # Get list of engagements costs
    engagement_cost_list = Enum.reduce(engaged_enemy_cards, [], fn(card, acc)->
      engagement_cost = get_value_from_cardpath(card, ["sides", "sideUp", "engagementCost"])
      acc = acc ++ [%{"engagement_cost" => engagement_cost, "id" => card["id"]}]
    end)
    # Sort by engagement cost
    sorted_enemy_list = Enum.reverse(Enum.sort_by(engagement_cost_list, &Map.fetch(&1, "engagement_cost")))
    # Deal shadows
    Enum.reduce(sorted_enemy_list, gameui, fn(item, acc) ->
      acc = deal_shadow(acc, item["id"])
    end)
  end

  def deal_all_shadows(gameui) do
    player_order = get_player_order(gameui)
    Enum.reduce(player_order, gameui, fn(player_n, acc) ->
      deal_player_n_shadows(acc, player_n)
    end)
  end

  def update_value(obj, update) do
    case Enum.count(update) do
      0 ->
        obj
      1 ->
        Enum.at(update, 0)
      _ ->
        put_in(obj[Enum.at(update,0)], update_value(obj[Enum.at(update,0)], List.delete_at(update, 0)))
    end
  end

  def update_values(gameui, updates) do
    Enum.reduce(updates, gameui, fn(update, acc) ->
      acc = update_value(acc, update)
    end)
  end


  def shuffle_group(gameui, group_id) do
    shuffled_stack_ids = get_stack_ids(gameui, group_id) |> Enum.shuffle
    update_stack_ids(gameui, group_id, shuffled_stack_ids)
  end

  def get_player_n(gameui, user_id) do
    ids = gameui["playerIds"]
    if user_id == nil do
      nil
    else
      cond do
        ids["player1"] == user_id -> "player1"
        ids["player2"] == user_id -> "player2"
        ids["player3"] == user_id -> "player3"
        ids["player4"] == user_id -> "player4"
        true -> nil
      end
    end
  end

  def add_card_row_to_group(gameui, group_id, card_row) do
    controller = get_group_controller(gameui, group_id)
    group_size = Enum.count(get_stack_ids(gameui, group_id))
    # Can't insert a card directly into a group need to make a stack first
    new_card = Card.card_from_cardrow(card_row, controller)
    new_stack = Stack.stack_from_card(new_card)
    gameui
    |> insert_stack_in_group(group_id, new_stack["id"], group_size)
    |> update_stack(new_stack)
    |> update_card(new_card)
    |> update_card_state(new_card["id"], false, "sharedStaging")
  end

  def load_card(gameui, card_row, group_id, quantity) do
    type = card_row["sides"]["A"]["type"]
    if quantity > 0 do
      Enum.reduce(1..quantity, gameui, fn(index, acc) ->
        stack_ids = get_stack_ids(gameui, group_id)
        acc = add_card_row_to_group(acc, group_id, card_row)
      end)
    else
      gameui
    end
  end

  def shuffle_changed_decks(old_gameui, new_gameui) do
    group_by_id = new_gameui["game"]["groupById"]
    Enum.reduce(group_by_id, new_gameui, fn({group_id, group}, acc) ->
      # Check if the number of stacks in the deck has changed, and if so, we shuffle
      old_stack_ids = get_stack_ids(old_gameui, group_id)
      new_stack_ids = get_stack_ids(new_gameui, group_id)
      acc = if group["type"] == "deck" and Enum.count(old_stack_ids) != Enum.count(new_stack_ids) do
        shuffle_group(acc, group_id)
      else
        acc
      end
    end)
  end

  def load_cards(gameui, player_n, load_list) do
    # Get deck size before load
    player_n_deck_id = player_n<>"Deck"
    deck_size_before = Enum.count(get_stack_ids(gameui, player_n_deck_id))
    old_gameui = gameui

    gameui = Enum.reduce(load_list, gameui, fn r, acc ->
      load_card(acc, r["cardRow"], r["groupId"], r["quantity"])
    end)

    # Check if we should load the first quest card
    main_quest_stack_ids = get_stack_ids(gameui, "sharedMainQuest")
    quest_deck_stack_ids = get_stack_ids(gameui, "sharedQuestDeck")
    gameui = if Enum.count(quest_deck_stack_ids)>0 && Enum.count(main_quest_stack_ids)==0 do
      # Dump nightmare/campaign cards into staging
      Enum.reduce_while(quest_deck_stack_ids, gameui, fn(stack_id, acc) ->
        card = get_top_card_of_stack(acc, stack_id)
        card_type = card["sides"]["A"]["type"]
        case card_type do
          "Nightmare" ->
            {:cont, move_stack(acc, stack_id, "sharedStaging", 0)}
          "Campaign" ->
            {:cont, move_stack(acc, stack_id, "sharedStaging", 0)}
          "Quest" ->
            {:halt, move_stack(acc, stack_id, "sharedMainQuest", 0)}
          _ ->
            acc
        end
      end)
    else
      gameui
    end

    # Calculate threat cost
    threat = Enum.reduce(load_list, 0, fn(r, acc) ->
      sideA = r["cardRow"]["sides"]["A"]
      if sideA["type"] == "Hero" && r["groupId"] == player_n<>"Play1" do
        acc + CardFace.convert_to_integer(sideA["cost"])*r["quantity"]
      else
        acc
      end
    end)
    # Add to starting threat
    current_threat = gameui["game"]["playerData"][player_n]["threat"]
    gameui = put_in(gameui["game"]["playerData"][player_n]["threat"], current_threat + threat)

    # If deck size has increased from 0, assume it is at start of game and a draw of 6 is needed
    round_number = gameui["game"]["roundNumber"]
    round_step = gameui["game"]["roundStep"]
    deck_size_after = Enum.count(get_stack_ids(gameui, player_n_deck_id))

    # Shuffle decks with new cards
    gameui = shuffle_changed_decks(old_gameui, gameui)

    # Check if a hand needs to be drawn
    gameui = if round_number == 0 && round_step == "0.0" && deck_size_before == 0 && deck_size_after > 6 do
      Enum.reduce(1..6, gameui, fn(i, acc) ->
        stack_ids = get_stack_ids(acc, player_n_deck_id)
        acc = move_stack(acc, Enum.at(stack_ids, 0), player_n<>"Hand", -1)
      end)
    else
      gameui
    end
  end

  # Obtain a flattened list of all cards in the game, where each card has the additional keys group_id, stack_index, and card_index
  def flat_list_of_cards(gameui) do
    card_by_id = gameui["game"]["cardById"]
    all_cards = Enum.reduce(card_by_id, [], fn({card_id, card}, acc) ->
      my_gsc = gsc(gameui, card_id)
      {group_id, stack_index, card_index} = my_gsc
      group_type = get_group_type(gameui, group_id)
      card = Map.merge(card, %{"groupId" => group_id, "stackIndex" => stack_index, "cardIndex" => card_index, "groupType" => group_type})
      acc ++ [card]
    end)
  end

  # Criteria is a list like: [["sides","sideUp","type","Hero"], ["controller",playerN], ["groupType","play"]],
  def get_cards_matching_criteria(gameui, criteria) do
    flat_list = flat_list_of_cards(gameui)
    Enum.reduce(flat_list, [], fn(card, acc) ->
      acc = if passes_criteria(card, criteria) do
        acc ++ [card]
      else
        acc
      end
    end)
  end

  def action_on_matching_cards(gameui, criteria, action, options \\ nil) do
    flat_list = flat_list_of_cards(gameui)
    Enum.reduce(flat_list, gameui, fn(card, acc) ->
      acc = if passes_criteria(card, criteria) do
        card_action(acc, card["id"], action, options)
      else
        acc
      end
    end)
  end

  def next_player(gameui, player_n) do
    seated_player_ns = seated_non_eliminated(gameui)
    seated_player_ns2 = seated_player_ns ++ seated_player_ns
    next = Enum.reduce(Enum.with_index(seated_player_ns2), nil, fn({player_i, index}, acc) ->
      if !acc && player_i == player_n do
        acc = Enum.at(seated_player_ns2, index+1)
      else
        acc
      end
    end)
    if next == player_n do
      nil
    else
      next
    end
  end

  def pass_first_player_token(gameui) do
    current_first_player = gameui["game"]["first_player"]
    next_first_player = next_player(gameui, current_first_player)
    if !next_first_player do
      gameui
    else
      put_in(gameui["game"]["first_player"], next_first_player)
    end
  end

  # List of PlayerN strings of players that are seated and not eliminated
  def seated_non_eliminated(gameui) do
    player_ids = gameui["playerIds"]
    player_data = gameui["game"]["playerData"]
    Enum.reduce(["player1","player2","player3","player4"], [], fn(player_n, acc) ->
      acc = if player_ids[player_n] && !player_data[player_n]["eliminated"] do
        acc ++ [player_n]
      else
        acc
      end
    end)
  end

  # Get leftmost player that is not elimiated. Useful for once per round actions like passing 1st player token so
  # that it doesn't get passed twice
  def leftmost_non_eliminated_player_n(gameui) do
    seated_player_ns = seated_non_eliminated(gameui)
    Enum.at(seated_player_ns,0) || "player1"
  end

  # Increment a player's threat
  def increment_threat(gameui, player_n, increment) do
    current_threat = gameui["game"]["playerData"][player_n]["threat"];
    put_in(gameui["game"]["playerData"][player_n]["threat"], current_threat + increment)
  end

  # Increment a player's willpower
  def increment_willpower(gameui, player_n, increment) do
    current_willpower = gameui["game"]["playerData"][player_n]["willpower"];
    if increment do
      put_in(gameui["game"]["playerData"][player_n]["willpower"], current_willpower + increment)
    else
      gameui
    end
  end

end
