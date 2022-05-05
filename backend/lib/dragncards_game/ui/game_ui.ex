defmodule DragnCardsGame.GameUI do
  @moduledoc """
  One level on top of Game.
  """


  require Logger
  alias DragnCardsGame.{Game, GameUI, GameUISeat, Groups, Group, Stack, Card, User, Tokens, CardFace, PlayerInfo}
  alias DragnCardsChat.{ChatMessage}

  alias DragnCards.{Repo, Replay}
  alias DragnCards.Rooms.Room

  @type t :: Map.t()

  @spec new(String.t(), User.t(), Map.t()) :: GameUI.t()
  def new(game_name, user, %{} = options) do
    Logger.debug("gameui new")
    gameui = %{
      "game" => Game.load(options),
      "pluginId" => "lotrlcg",
      "gameName" => game_name,
      "options" => options,
      "created_at" => DateTime.utc_now(),
      "created_by" => user.id,
      "privacyType" => options["privacyType"],
      "playerInfo" => %{
        "player1" => PlayerInfo.new(user.id),
        "player2" => nil,
        "player3" => nil,
        "player4" => nil,
      },
      "playersInRoom" => %{},
      "lastUpdate" => System.system_time(:second),
    }
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
      IO.puts("Error finding stack index")
      IO.inspect(game)
      IO.inspect(stack_id)
      IO.inspect(group_id)
      IO.inspect(stack_ids)
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

  def update_targeting(game, card_id, new_targeting) do
    put_in(game["cardById"][card_id]["targeting"], new_targeting)
  end

  def update_tokens(game, card_id, new_tokens) do
    put_in(game["cardById"][card_id]["tokens"], new_tokens)
  end

  def update_token(game, card_id, token_type, new_value) do
    put_in(game["cardById"][card_id]["tokens"][token_type], new_value)
  end


  ############################################################
  # Card actions                                             #
  ############################################################
  def card_action(game, card_id, action, options) do
    Logger.debug("card_action #{action}")
    card = get_card(game, card_id)
    game = case action do
      "update_card_values" ->
        update_card_values(game, card_id, options["updates"])
      "increment_token" ->
        increment_token(game, card_id, options["token_type"], options["increment"])
      "apply_tokens_per_round" ->
        apply_tokens_per_round(game, card_id)
      "delete_card" ->
        delete_card(game, card_id)
      "flip_card" ->
        flip_card(game, card_id)
      "discard_card" ->
        discard_card(game, card_id)
      "add_trigger" ->
        add_trigger(game, card_id, options["round_step"])
      "remove_trigger" ->
        remove_trigger(game, card_id, options["round_step"])
      "move_card" ->
        move_card(game, card_id, options["dest_group_id"], options["dest_stack_index"], options["dest_card_index"], options["combine"], options["preserve_state"])
      "exhaust" ->
        exhaust(game, card_id)
      "ready" ->
        ready(game, card_id)
        _ ->
        game
    end
  end

  # Discard a card
  def discard_card(game, card_id) do
    card = get_card(game, card_id)
    move_card(game, card_id, card["discardGroupId"], 0, 0, false, false)
  end

  # Update a single card parameter
  def update_card_value(game, card_id, update) do
    update_value(game, ["cardById", card_id] ++ update)
  end

  # Update multiple parameters of a card
  def update_card_values(game, card_id, updates) do
    Enum.reduce(updates, game, fn(update, acc) ->
      acc = update_card_value(acc, card_id, update)
    end)
  end

  # Add tokens per round to card
  def apply_tokens_per_round(game, card_id) do
    tokens_per_round = get_tokens_per_round(game, card_id)
    Enum.reduce(tokens_per_round, game, fn({token_type, increment}, acc) ->
      acc = increment_token(acc, card_id, token_type, increment)
    end)
  end

  # Exhaust
  def exhaust(game, card_id) do
    card = get_card(game, card_id)
    if card["exhausted"] do
      game
    else
      toggle_exhaust(game, card_id)
    end
  end

  # Ready
  def ready(game, card_id) do
    card = get_card(game, card_id)
    if !card["exhausted"] do
      game
    else
      toggle_exhaust(game, card_id)
    end
  end

  # Move a card
  def move_card_gameui(gameui, card_id, dest_group_id, dest_stack_index, dest_card_index, combine, preserve_state) do
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

  # Move a card
  def move_card(game, card_id, dest_group_id, dest_stack_index, dest_card_index, combine, preserve_state) do
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
    |> update_card_state(card_id, preserve_state, orig_group_id)
  end

  # Increment a token
  def increment_token(game, card_id, token_type, increment) do
    old_value = get_token(game, card_id, token_type)
    new_value = if old_value + increment < 0 && Enum.member?(["resource", "progress", "damage", "time"], token_type) do
      0
    else
      old_value + increment
    end
    update_token(game, card_id, token_type, new_value)
  end

  # Increment multiple tokens
  def increment_token(game, card_id, token_increments) do
    Enum.reduce(token_increments, game, fn({k,v}, acc) ->
      acc = increment_token(acc, card_id, k, v)
    end)
  end

  # Increment tokens for a list of card ids
  def increment_tokens_object(game, increment_object) do
    Enum.reduce(increment_object, game, fn({k,v}, acc) ->
      acc = increment_token(acc, k, v)
    end)
  end

  def target_card_ids(game, card_ids, player_n) do
    Enum.reduce(card_ids, game, fn(card_id, acc) ->
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
  def toggle_exhaust(game, card_id) do
    card = get_card(game, card_id)
    new_card = if card["exhausted"] do
      card = put_in(card["exhausted"], false)
      put_in(card["rotation"], 0)
    else
      card = put_in(card["exhausted"], true)
      put_in(card["rotation"], 90)
    end
    update_card(game, new_card)
  end

  # Flip a card
  def flip_card(game, card_id) do
    {group_id, stack_index, card_index} = gsc(game, card_id)
    group_type = get_group_type(game, group_id)
    # If in play, remove triggers
    game = if group_type === "play" do
      remove_triggers(game, card_id)
    else
      game
    end
    # Flip card
    old_card = get_card(game, card_id)
    current_side = old_card["currentSide"]
    new_card = if current_side == "A" do
      put_in(old_card["currentSide"],"B")
    else
      put_in(old_card["currentSide"],"A")
    end
    game = update_card(game, new_card)
    # If in play, add triggers
    if group_type === "play" do
      add_triggers(game, card_id)
    else
      game
    end
  end

  # Deal a shadow card
  def deal_shadow(game, card_id) do
    {group_id, stack_index, card_index} = gsc(game, card_id)
    stack = get_stack_by_card_id(game, card_id)
    shadow_card = get_card_by_gsc(game, ["sharedEncounterDeck", 0, 0])
    if shadow_card do
      cards_size = Enum.count(stack["cardIds"])
      game = move_card(game, shadow_card["id"], group_id, stack_index, cards_size, true, true)
      rotated_shadow_card = put_in(shadow_card["rotation"], -30)
      update_card(game, rotated_shadow_card)
    else
      game
    end
  end

  # Detach a card
  def detach(game, card_id) do
    card = get_card(game, card_id)
    # If it's rotated and not exhausted, it's a shadow card, so when we detach it we want to set its rotation to 0.
    card = if card["exhausted"] == false && card["rotation"] != 0 do
      put_in(card["rotation"], 0)
    else
      card
    end
    game = update_card(game, card)
    # Get position of card and move it next to the initial stack
    {group_id, stack_index, card_index} = gsc(game, card_id)
    move_card(game, card_id, group_id, stack_index + 1, 0, false, true)
  end

  def deck_group_id_for_dest_group_id(dest_group_id) do
    case dest_group_id do
      "player1Deck" ->
        "player1Deck"
      "player1Discard" ->
        "player1Deck"
      "player1Deck2" ->
        "player1Deck"
      "player2Deck" ->
        "player2Deck"
      "player2Discard" ->
        "player2Deck"
      "player2Deck2" ->
        "player2Deck"
      "player3Deck" ->
        "player3Deck"
      "player3Discard" ->
        "player3Deck"
      "player3Deck2" ->
        "player3Deck"
      "player4Deck" ->
        "player4Deck"
      "player4Discard" ->
        "player4Deck"
      "player4Deck2" ->
        "player4Deck"
      "sharedEncounterDeck" ->
        "sharedEncounterDeck"
      "sharedEncounterDeck2" ->
        "sharedEncounterDeck2"
      "sharedEncounterDeck3" ->
        "sharedEncounterDeck3"
      "sharedEncounterDiscard" ->
        "sharedEncounterDeck"
      "sharedEncounterDiscard2" ->
        "sharedEncounterDeck2"
      "sharedEncounterDiscard3" ->
        "sharedEncounterDeck3"
      "sharedQuestDeck" ->
        "sharedQuestDeck"
      "sharedQuestDeck2" ->
        "sharedQuestDeck2"
      "sharedQuestDiscard" ->
        "sharedQuestDeck"
      "sharedQuestDiscard2" ->
        "sharedQuestDeck2"
      _ ->
        "sharedEncounterDeck"
    end
  end

  def discard_group_id_for_dest_group_id(dest_group_id) do
    case dest_group_id do
      "player1Deck" ->
        "player1Discard"
      "player1Discard" ->
        "player1Discard"
      "player1Deck2" ->
        "player1Discard"
      "player2Deck" ->
        "player2Discard"
      "player2Discard" ->
        "player2Discard"
      "player2Deck2" ->
        "player2Discard"
      "player3Deck" ->
        "player3Discard"
      "player3Discard" ->
        "player3Discard"
      "player3Deck2" ->
        "player3Discard"
      "player4Deck" ->
        "player4Discard"
      "player4Discard" ->
        "player4Discard"
      "player4Deck2" ->
        "player4Discard"
      "sharedEncounterDeck" ->
        "sharedEncounterDiscard"
      "sharedEncounterDeck2" ->
        "sharedEncounterDiscard2"
      "sharedEncounterDeck3" ->
        "sharedEncounterDiscard3"
      "sharedEncounterDiscard" ->
        "sharedEncounterDiscard"
      "sharedEncounterDiscard2" ->
        "sharedEncounterDiscard2"
      "sharedEncounterDiscard3" ->
        "sharedEncounterDiscard3"
      "sharedQuestDeck" ->
        "sharedQuestDiscard"
      "sharedQuestDeck2" ->
        "sharedQuestDiscard2"
      "sharedQuestDiscard" ->
        "sharedQuestDiscard"
      "sharedQuestDiscard2" ->
        "sharedQuestDiscard2"
      _ ->
        "sharedEncounterDiscard"
    end
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
  def update_card_state(game, card_id, preserve_state, orig_group_id) do
    if preserve_state do
      # We still remove arrows
      #card = put_in(card["arrowIds"], [])
      #update_card(game, card)
      game
    else
      card = get_card(game, card_id)
      card_old = card
      card_name = card["sides"]["A"]["name"]
      card_face = get_current_card_face(game, card_id)
      dest_group = get_group_by_card_id(game, card_id)
      dest_group_id = dest_group["id"]
      orig_group_type = get_group_type(game, orig_group_id)
      dest_group_type = get_group_type(game, dest_group_id)
      card_index = get_card_index_by_card_id(game, card_id)
      card = put_in(card["inPlay"], dest_group_type == "play")
      card = put_in(card["groupId"], dest_group_id)
      card = put_in(card["cardIndex"], card_index)

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
        |> Map.put("roundEnteredPlay", game["round"])
        |> Map.put("phaseEnteredPlay", game["phase"])
        |> Map.put("inPlay", true)
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
        |> Map.put("inPlay", false)
        |> clear_targets()
      else card end
      # Entering deck: flip card facedown, no peeking
      card = if dest_group_type == "deck" do
        new_deck_id = deck_group_id_for_dest_group_id(dest_group_id)
        new_discard_id = discard_group_id_for_dest_group_id(dest_group_id)
        card
        |> Map.put("currentSide", "B")
        |> Map.put("owner", new_controller)
        |> Map.put("deckGroupId", new_deck_id)
        |> Map.put("discardGroupId", new_discard_id)
        |> set_all_peeking(false)
      else card end
      # Entering discard: flip card faceup, no peeking
      card = if dest_group_type == "discard" do
        new_deck_id = deck_group_id_for_dest_group_id(dest_group_id)
        new_discard_id = discard_group_id_for_dest_group_id(dest_group_id)
        card
        |> Map.put("currentSide", "A")
        |> Map.put("deckGroupId", new_deck_id)
        |> Map.put("discardGroupId", new_discard_id)
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
        controller = get_group_controller(game, dest_group_id)
        put_in(card["peeking"][controller], true)
      else card end
      # Entering hand that is visible. Set all peeking to true
      card = if dest_group_type == "hand" and game["playerData"][dest_group["controller"]]["visibleHand"] do
        card = set_all_peeking(card, true)
      else
        card
      end
      game = update_card(game, card)
      # Update game based on card moving
      # Handle triggers
      game = if dest_group_type == "play" do
        add_triggers_card_face(game, card_id, card_face)
      else
        remove_triggers_card_face(game, card_id, card_face)
      end
      # Handle committed willpower leaving play
      game = if committed_willpower > 0 and dest_group_type !== "play" and old_controller !== "shared" do
        old_controller_willpower = game["playerData"][old_controller]["willpower"]
        put_in(game["playerData"][old_controller]["willpower"], old_controller_willpower - committed_willpower)
      else
        game
      end
      # Handle committed willpower changing control
      game = if committed_willpower > 0 and old_controller !== new_controller and old_controller !== "shared" do
        old_controller_willpower = game["playerData"][old_controller]["willpower"]
        game = put_in(game["playerData"][old_controller]["willpower"], old_controller_willpower - committed_willpower)
        if new_controller !== "shared" do
          new_controller_willpower = game["playerData"][new_controller]["willpower"]
          put_in(game["playerData"][new_controller]["willpower"], new_controller_willpower + committed_willpower)
        else
          game
        end
      else
        game
      end
    end
  end

  # Delete card from game
  def delete_card(game, card_id) do
    game
    |> delete_card_from_card_by_id(card_id)
    |> remove_from_stack(card_id)
  end

  def delete_card_from_card_by_id(game, card_id) do
    old_card_by_id = game["cardById"]
    new_card_by_id = Map.delete(old_card_by_id, card_id)
    put_in(game["cardById"], new_card_by_id)
  end

  # Removes a card from a stack, but is stays in cardById
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

  def peek_card(game, player_n, card_id, value) do
    card = get_card(game, card_id)
    card = if card["currentSide"] == "B" do # Only peek if card is facedown
      if player_n == "all" do
        set_all_peeking(card, value)
      else
        put_in(card["peeking"][player_n], value)
      end
    else
      card
    end
    update_card(game, card)
  end

  def add_trigger(game, card_id, round_step) do
    old_round_step_triggers = game["triggerMap"][round_step]
    if old_round_step_triggers && Enum.member?(old_round_step_triggers, card_id) do
      game
    else
      new_round_step_triggers = if old_round_step_triggers do
        old_round_step_triggers ++ [card_id]
      else
        [card_id]
      end
      put_in(game["triggerMap"][round_step], new_round_step_triggers)
    end
  end

  def add_triggers(game, card_id) do
    card_face = get_current_card_face(game, card_id)
    add_triggers_card_face(game, card_id, card_face)
  end

  def add_triggers_card_face(game, card_id, card_face) do
    card_triggers = card_face["triggers"]
    Enum.reduce(card_triggers, game, fn(round_step, acc) ->
      acc = add_trigger(acc, card_id, round_step)
    end)
  end

  def remove_trigger(game, card_id, round_step) do
    old_round_step_triggers = game["triggerMap"][round_step]
    if old_round_step_triggers && Enum.member?(old_round_step_triggers, card_id) do
      put_in(game["triggerMap"][round_step], Enum.reject(old_round_step_triggers, &(&1 == card_id)))
    else
      game
    end
  end

  def remove_triggers(game, card_id) do
    card_face = get_current_card_face(game, card_id)
    remove_triggers_card_face(game, card_id, card_face)
  end

  def remove_triggers_card_face(game, card_id, card_face) do
    card_triggers = card_face["triggers"]
    Enum.reduce(card_triggers, game, fn(round_step, acc) ->
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

  def passes_criterion(card, obj, criterion, exact_match \\ true) do
    case Enum.count(criterion) do
      0 ->
        false
      1 ->
        value = Enum.at(criterion, 0)
        if exact_match do
          obj == value
        else
          String.contains?(obj, value)
        end
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
        if property == "traits" do
          passes_criterion(card, obj[property], List.delete_at(criterion, 0), false)
        else
          passes_criterion(card, obj[property], List.delete_at(criterion, 0))
        end
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

  def peek_stack(game, stack_id, player_n, value) do
    card_ids = get_card_ids(game, stack_id)
    Enum.reduce(card_ids, game, fn(card_id, acc) ->
      card = get_card(game, card_id)
      acc = peek_card(acc, player_n, card_id, value)
    end)
  end

  def peek_at(game, stack_ids, player_n, value) do
    Enum.reduce(stack_ids, game, fn(stack_id, acc) ->
      acc = peek_stack(acc, stack_id, player_n, value)
    end)
  end

  def set_stack_ids_peeking_all(game, stack_ids, value) do
    Enum.reduce(["player1" ,"player2", "player3", "player4"], game, fn(player_n, acc) ->
      peek_at(acc, stack_ids, player_n, value)
    end)
  end

  def get_top_card_of_stack(game, stack_id) do
    stack = get_stack(game, stack_id)
    card_id = Enum.at(stack["cardIds"],0)
    get_card(game, card_id)
  end


  def target_stack(game, player_n, stack_id) do
    card_ids = get_card_ids(game, stack_id)
    card_id = Enum.at(card_ids, 0)
    old_targeting = get_targeting(game, card_id)
    new_targeting = put_in(old_targeting[player_n], true)
    update_targeting(game, card_id, new_targeting)
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

  def update_stack_state(game, stack_id, options) do
    preserve_state = Enum.at(options, 0)
    orig_group_id = Enum.at(options, 1)
    if preserve_state do
      game
    else
      # Update cards in stack one at a time in reverse order
      # This is so that when the stack is removed from play,
      # order is preserved as cards are detached
      stack = get_stack(game, stack_id)
      dest_group = get_group_by_stack_id(game, stack_id)
      dest_group_id = dest_group["id"]
      card_ids = get_card_ids(game, stack_id)
      game = Enum.reduce(card_ids, game, fn(card_id, acc) ->
        acc = update_card_state(acc, card_id, preserve_state, orig_group_id)
      end)
      # If a stack is out of play, we need to split it up
      if Enum.count(card_ids)>1 && get_group_type(game, dest_group_id) != "play" do
        reverse_card_ids = Enum.reverse(card_ids)
        Enum.reduce(reverse_card_ids, game, fn(card_id, acc) ->
          acc = detach(acc, card_id)
        end)
      else
        game
      end
    end
  end

  def move_stack(game, stack_id, dest_group_id, dest_stack_index, combine \\ false, preserve_state \\ false) do
    IO.puts("move_stack #{stack_id} #{dest_group_id} #{dest_stack_index} ")
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
        game = update_stack_state(game, dest_stack_id, [preserve_state, orig_group_id])
      else
        # Update destination group stack ids
        old_dest_stack_ids = get_stack_ids(game, dest_group_id)
        new_dest_stack_ids = List.insert_at(old_dest_stack_ids, dest_stack_index, stack_id)
        game = update_stack_ids(game, dest_group_id, new_dest_stack_ids)
        |> update_stack_state(stack_id, [preserve_state, orig_group_id])
      end
    end
  end

  def move_stacks(game, orig_group_id, dest_group_id, top_n, position) do
    orig_stack_ids = get_stack_ids(game, orig_group_id)
    # Moving stacks to the top or the bottom of the new group?
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

  def deal_x(game, group_id, dest_group_id, top_x) do
    stack_ids = get_stack_ids(game, group_id)
    top_x = if Enum.count(stack_ids) < top_x do Enum.count(stack_ids) else top_x end
    top_x_stack_ids = Enum.slice(stack_ids, 0, top_x)
    game = set_stack_ids_peeking_all(game, stack_ids, false)
    game = if top_x > 0 do
      move_stack(game, Enum.at(top_x_stack_ids,0), dest_group_id, -1, false, true)
    else
      game
    end
    game = if top_x > 1 do
      Enum.reduce(1..(top_x-1), game, fn(index, acc) ->
        move_stack(acc, Enum.at(top_x_stack_ids,index), dest_group_id, -1, true, true)
      end)
    else
      game
    end
  end

  def peek_at_by_indices(game, group_id, indices, player_n, value) do
    group_stack_ids = get_stack_ids(game, group_id)
    num_stacks = Enum.count(group_stack_ids)
    selected_stack_ids = Enum.reduce(indices, [], fn(index, acc) ->
      index = if index < 0 do index = num_stacks + index else index end
      acc = if index >= num_stacks do
        acc
      else
        acc ++ [Enum.at(group_stack_ids, index)]
      end
    end)
    peek_at(game, selected_stack_ids, player_n, value)
  end

  ################################################################
  # Game actions                                                 #
  ################################################################
  def game_action(gameui, user_id, action, options) do
    user_alias = get_alias_by_user_id(gameui, user_id)
    player_n = get_player_n(gameui, user_id)
    player_n = if options["for_player_n"] do options["for_player_n"] else player_n end
    Logger.debug("game_action #{user_id} #{player_n} #{action}")
    game = gameui["game"]
    game = put_in(game["playerUi"], options["player_ui"])
    game_new = if player_n do
      case action do
        "game_action_list" ->
          multiple_map_changes(game, game, options["action_list"], user_alias)
        "draw_card" ->
          draw_card(game, player_n)
        "new_round" ->
          new_round(game, player_n, user_id)
        "refresh" ->
          refresh(game, player_n)
        "refresh_and_new_round" ->
          refresh_and_new_round(game, player_n, user_id)
        "peek_at" ->
          peek_at(game, options["stack_ids"], player_n, options["value"])
        "peek_card" ->
          peek_card(game, player_n, options["card_id"], options["value"])
        "flip_card" ->
          flip_card(game, options["card_id"])
        "move_card" ->
          move_card(game, options["card_id"], options["dest_group_id"], options["dest_stack_index"], options["dest_card_index"], options["combine"], options["preserve_state"])
        "target_stack" ->
          target_stack(game, player_n, options["stack_id"])
        "move_stack" ->
          move_stack(game, options["stack_id"], options["dest_group_id"], options["dest_stack_index"], options["combine"], options["preserve_state"])
        "move_stacks" ->
          move_stacks(game, options["orig_group_id"], options["dest_group_id"], options["top_n"], options["position"])
        "shuffle_group" ->
          shuffle_group(game, options["group_id"])
        "detach" ->
          detach(game, options["card_id"])
        "set_game" ->
          options["game"]
        "update_values" ->
          update_values(game, options["updates"])
        "action_on_matching_cards" ->
          action_on_matching_cards(game, options["criteria"], options["action"], options["options"])
        "deal_shadow" ->
          deal_shadow(game, options["card_id"])
        "deal_all_shadows" ->
          deal_all_shadows(game)
        "increment_threat" ->
          increment_threat(game, player_n, options["increment"])
        "increment_willpower" ->
          increment_willpower(game, player_n, options["increment"])
        "increment_token" ->
          increment_token(game, options["card_id"], options["token_type"], options["increment"])
        "increment_tokens" ->
          increment_token(game, options["card_id"], options["token_increments"])
        "increment_tokens_object" ->
          increment_tokens_object(game, options["increment_object"])
        "reset_game" ->
          reset_game(game)
        "load_cards" ->
          load_cards(game, player_n, options["load_list"])
        "target_card_ids" ->
          target_card_ids(game, options["card_ids"], player_n)
        "step_through" ->
          step_through(game, options["size"], options["direction"])
        "save_replay" ->
          save_replay(game, user_id)
        "card_action" ->
          card_action(game, options["card_id"], options["action"], options["options"])
        "deal_x" ->
          deal_x(game, options["group_id"], options["dest_group_id"], options["top_x"])
        "peek_at_by_indices" ->
          peek_at_by_indices(game, options["group_id"], options["indices"], player_n, options["value"])
        _ ->
          game
      end
    end
    # Compare state before and after, and add a delta (unless we are undoing a move or loading a game with undo info)
    game_new = Map.delete(game_new, "playerUi")
    gameui = if options["preserve_undo"] != true do
      game_new = Game.add_delta(game_new, game)
      put_in(gameui["game"], game_new)
    else
      put_in(gameui["game"]["replayLength"], Enum.count(gameui["game"]["deltas"]))
    end
    set_last_update(gameui)
  end

  def get_alias_by_user_id(game, user_id) do
    user_alias = Enum.reduce_while(game["playerInfo"], nil, fn({playerI, playerInfo}, acc) ->
      if user_id == playerInfo["id"] do
        {:halt, playerInfo["alias"]}
      else
        {:cont, acc}
      end
    end)
  end


  def multiple_map_changes(game, map, map_changes, user_alias) do
    IO.puts("a1")
    Enum.reduce(map_changes, map, fn(options, acc) ->
      change_map(game, acc, options, user_alias)
    end)
  end

  def is_path(path) do
    is_list(path) and Enum.member?(["_GAME", "_ACTIVE_CARD", "_ACTIVE_FACE", "_ITEM"], Enum.at(path, 0))
  end

  def get_nested_value(game, map, path) do
#    IO.puts("getting nested value from ")
#    IO.inspect(map)
#    IO.puts("path")
#    IO.inspect(path)
#    IO.puts("path b")
    if is_path(path) do
      get_in(map, get_keylist_from_path(game, map, path))
    else
      path
    end
  end

  def flatten_path(game, map, path) do
    flattened = Enum.reduce(path, [], fn(key, acc) ->
      acc ++ if is_list(key) do
        IO.puts("path a")
        IO.inspect(path)
        [get_nested_value(game, map, key)]
      else
        case key do
          "_ACTIVE_CARD" ->
            flatten_path(game, map, ["_GAME", "cardById", ["_GAME", "playerUi", "activeCardId"]])
          "_ACTIVE_FACE" ->
            flatten_path(game, map, ["_ACTIVE_CARD", "sides", ["_ACTIVE_CARD", "currentSide"]])
          _ ->
            [key]
        end
      end
    end)
    IO.puts("flattened")
    IO.inspect(flattened)
    flattened
  end

  def get_keylist_from_path(game, map, path) do
    flat_path = flatten_path(game, map, path)
    List.delete_at(flat_path, 0) # remove "keyList"
  end

  def evaluate_condition(game, map, condition) do
    IO.puts("checking ")
    IO.inspect(condition)
    # A condition is a list of 3 things. Value A, an operator, and value B
    if Enum.count(condition) == 3 do
      lhs = Enum.at(condition, 0)
      operator = Enum.at(condition, 1)
      rhs = Enum.at(condition, 2)
      IO.puts("path cond")
      IO.inspect(lhs)
      IO.inspect(rhs)
      lhs = if Enum.member?(["AND","OR"], operator) do lhs else get_nested_value(game, map, lhs) end
      rhs = if Enum.member?(["AND","OR"], operator) do rhs else get_nested_value(game, map, rhs) end
      IO.inspect(lhs)
      IO.inspect(rhs)
      res = case operator do
        "==" ->
          lhs == rhs
        "!=" ->
          lhs != rhs
        ">" ->
          is_number(lhs) and is_number(rhs) and lhs > rhs
        "<" ->
          is_number(lhs) and is_number(rhs) and lhs < rhs
        ">=" ->
          is_number(lhs) and is_number(rhs) and lhs >= rhs
        "<=" ->
          is_number(lhs) and is_number(rhs) and lhs <= rhs
        "IN_STRING" ->
          is_binary(lhs) and is_binary(rhs) and String.contains?(rhs, lhs)
        "CONTAINS_IN_STRING" ->
          is_binary(lhs) and is_binary(rhs) and String.contains?(lhs, rhs)
        "IN_LIST" ->
          is_list(rhs) and Enum.member?(rhs, lhs)
        "CONTAINS_IN_LIST" ->
          is_list(lhs) and Enum.member?(lhs, rhs)
        "AND" ->
          evaluate_condition(game, map, lhs) and evaluate_condition(game, map, rhs)
        "OR" ->
          evaluate_condition(game, map, lhs) or evaluate_condition(game, map, rhs)
        _ ->
          False
      end
      IO.inspect(res)
      res
    else
      false
    end
  end

  def change_map(game, map, options, user_alias) do
    action = options["_ACTION"]
    IO.puts("action")
    IO.inspect(options)
    new_map = case action do
      "SET_VALUE" ->
        if Map.has_key?(options, "_PATH") and Map.has_key?(options, "_VALUE") do
          keylist = get_keylist_from_path(game, map, options["_PATH"])
          value = options["_VALUE"]
          IO.puts("setting")
          IO.inspect(keylist)
          IO.inspect(value)
          put_in(map, keylist, value)
        else map end
      "INCREASE_BY" ->
        if Map.has_key?(options, "_PATH") and Map.has_key?(options, "_VALUE") do
          path = options["_PATH"]
          keylist = get_keylist_from_path(game, map, path)
          old_value = get_nested_value(game, map, path)
          amount = options["_VALUE"]
          new_value = if is_number(old_value) and is_number(amount) do
            temp_value = old_value + amount
            if Map.has_key?(options, "_MAX") and is_number(options["_MAX"]) and temp_value > options["_MAX"] do
              options["_MAX"]
            else
              temp_value
            end
          else
            old_value
          end
          put_in(map, keylist, new_value)
        else map end
      "DECREASE_BY" ->
        if Map.has_key?(options, "_PATH") and Map.has_key?(options, "_VALUE") do
          path = options["_PATH"]
          keylist = get_keylist_from_path(game, map, path)
          old_value = get_nested_value(game, map, path)
          amount = options["_VALUE"]
          new_value = if is_number(old_value) and is_number(amount) do
            temp_value = old_value - amount
            if Map.has_key?(options, "_MIN") and is_number(options["_MIN"]) and temp_value < options["_MIN"] do
              options["_MIN"]
            else
              temp_value
            end
          else
            old_value
          end
          put_in(map, keylist, new_value)
        else map end
      "CASES" ->
        IO.puts("a2")
        if Map.has_key?(options, "_CASES") do
          IO.puts("a")
          Enum.reduce_while(options["_CASES"], map, fn(casei, acc) ->
            if Map.has_key?(casei, "_IF") and Map.has_key?(casei, "_THEN") do
              if evaluate_condition(game, acc, casei["_IF"]) do
                IO.puts("doing multiple_map_changes")
                {:halt, multiple_map_changes(game, acc, casei["_THEN"], user_alias)}
              else
                {:cont, acc}
              end
            else
              {:cont, acc}
            end
          end)
        else map end
      "FOR_EACH" ->
        if Map.has_key?(options, "_PATH") and Map.has_key?(options, "_DO") do
          IO.puts("path c")
          IO.inspect(options["_PATH"])
          maps = get_nested_value(game, map, options["_PATH"])
          keylist = get_keylist_from_path(game, map, options["_PATH"])
          for_each_actions = options["_DO"]
          new_maps = Enum.reduce(Map.keys(maps), maps, fn(k, acc) ->
            put_in(acc[k], multiple_map_changes(game, acc[k], for_each_actions, user_alias))
          end)
          put_in(map, keylist, new_maps)
        end
      "MOVE_CARD" ->
        if Map.has_key?(options, "_CARD_ID") and
            Map.has_key?(options, "_DEST_GROUP_ID") and
            Map.has_key?(options, "_DEST_STACK_INDEX") and
            Map.has_key?(options, "_DEST_CARD_INDEX") and
            Map.has_key?(options, "_COMBINE") do
              move_card(game, options["_CARD_ID"], options["_DEST_GROUP_ID"], options["_DEST_STACK_INDEX"], options["_DEST_STACK_INDEX"], options["_COMBINE"], options["_PRESERVE_STATE"])
        else map end
      _ ->
        map
    end
    new_map = if Map.has_key?(options, "_MESSAGES") do
      latest_chat_messages = Enum.reduce(options["_MESSAGES"], [], fn(message_segments, acc) ->
        message_text = resolve_message(game, message_segments, user_alias)
        chat_message = ChatMessage.new(message_text, 1, 1)
        IO.puts("adding message")
        IO.inspect(chat_message)
        acc ++ [chat_message]
      end)
      IO.puts("total messages")
      IO.inspect(latest_chat_messages)
      put_in(new_map["latestMessages"], latest_chat_messages)
    else new_map end
  end

  def resolve_message(game, message, user_alias) do
    resolved_message = Enum.reduce(message, "", fn(segment, acc) ->
      acc <> resolve_message_segment(game, segment)
    end)
    processed_message = String.replace(resolved_message, "{playerN}", user_alias)
  end

  def resolve_message_segment(game, segment) do
    segment = if is_path(segment) do
      get_nested_value(game, game, segment)
    else
      "#{segment}"
    end #|> Kernel.inspect()
  end
  # def process_game_action(gameui, action) do
  #   # An action is a map with an "action" key the dictates how we handle it
  #   if is_map(action) and Map.has_key?(action, "action") do
  #     case action["action"] do
  #       "conditions" ->
  #         if Map.has_key?(action,"conditions") and is_list(action["conditions"]) do
  #           Enum.reduce_while(action["conditions"], gameui, fn(ifthen, acc) ->
  #             if passes_conditions(acc, ifthen["if"]) do
  #               IO.puts("passes condtions")
  #               {:halt, game_action_list(acc, ifthen["then"])}
  #             else
  #               {:cont, acc}
  #             end
  #           end)
  #         else gameui end
  #       "setValue" ->
  #         if Map.has_key?(action, "key_list") and Map.has_key?(action, "value") do
  #           IO.puts("setValue")
  #           IO.inspect(action)
  #           put_in(gameui["game"], process_change(gameui["game"], gameui, gameui, action["key_list"], "setValue", %{"value" => action["value"]}))
  #         end
  #       "increaseBy" ->
  #         if Map.has_key?(action, "key_list") and Map.has_key?(action, "value") do
  #           put_in(gameui["game"], process_change(gameui["game"], gameui, gameui, action["key_list"], "increaseBy", %{"value" => action["value"], "limit" => action["limit"]}))
  #         end
  #       "moveCard" ->
  #         card_id = process_key(nil, nil, gameui, action["card_id"])
  #         move_card(gameui, card_id, action["dest_group_id"], action["dest_stack_index"], action["dest_card_index"], action["combine"], false)
  #       "moveStack" ->
  #         stack_id = process_key(nil, nil, gameui, action["stack_id"])
  #         dest_group_id = process_key(nil, nil, gameui, action["dest_group_id"])
  #         dest_stack_index = process_key(nil, nil, gameui, action["dest_stack_index"])
  #         move_stack(gameui, stack_id, dest_group_id, dest_stack_index, action["combine"], false)
  #       # "forEach" ->
  #       #   key = process_key(nil, nil, gameui, action["key_list"])
  #       #   objs_old = get_value_from_key_list
  #       end
  #   else
  #     gameui
  #   end
  # end

  # def passes_conditions(gameui, conditions) do
  #   Enum.reduce_while(conditions, true, fn(condition, acc) ->
  #     if passes_condition(gameui, condition) do
  #       {:cont, true}
  #     else
  #       {:halt, false}
  #     end
  #   end)
  # end

  # def passes_condition(gameui, condition) do
  #   if Enum.count(condition) == 3 do
  #     key_list = Enum.at(condition, 0)
  #     operator = Enum.at(condition, 1)
  #     rhs = Enum.at(condition, 2)
  #     lhs = process_key(gameui["game"], gameui, gameui, key_list)
  #     case operator do
  #       "equalTo" ->
  #         IO.puts("is #{lhs} equalto #{rhs}")
  #         lhs == rhs
  #       "stringContains" ->
  #         String.contains?(lhs, rhs)
  #       "inString" ->
  #         String.contains?(rhs, lhs)
  #       "isList" ->
  #         Enum.member?(rhs, lhs)
  #       "listContains" ->
  #         Enum.member?(lhs, rhs)
  #       "greaterThan" ->
  #         lhs > rhs
  #       "lessThan" ->
  #         lhs < rhs
  #       "notEqualTo" ->
  #         lhs != rhs
  #     end
  #   else
  #     false
  #   end
  # end

  # # def resolve_key_list(obj, parent, gameui, key_list) do
  # #   resolved_key_list = Enum.reduce(key_list, [], fn(key, acc) ->
  # #     if is_list(key) do
  # #       acc ++ get_value_from_key_list(gameui["game"], gameui, gameui, key)
  # #     else
  # #       acc ++ key
  # #     end
  # #   end)
  # # end

  # def get_value_from_key_list(obj, parent, gameui, key_list) do
  #   case Enum.count(key_list) do
  #     0 ->
  #       # If there are no more keys in the nested map to parse, we just return the object, which is normally now a base type
  #       obj
  #     _ ->
  #       IO.puts("key 1")
  #       IO.inspect(Enum.at(key_list, 0))
  #       key = process_key(obj, parent, gameui, Enum.at(key_list, 0))
  #       new_key_list = List.delete_at(key_list, 0)
  #       if is_integer(key) and is_list(obj) do
  #         length = Enum.count(obj)
  #         key = if key < 0 do length - key else key end
  #         if key < 0 or key >= length do
  #           nil
  #         else
  #           get_value_from_key_list(Enum.at(obj,key), obj, gameui, new_key_list)
  #         end
  #       else
  #         get_value_from_key_list(obj[key], obj, gameui, new_key_list)
  #       end
  #   end
  # end

  # def process_key(obj, parent, gameui, key) do
  #   key = if is_list(key) do
  #     # If a key is a list, it is a key_list and we need to obtain the key
  #     key_list = key
  #     get_value_from_key_list(gameui["game"], gameui, gameui, key_list)
  #   else key end
  #   # Handle special cases
  #   IO.puts("process_key 1")
  #   IO.inspect(key)
  #   key = if is_binary(key) do
  #     IO.puts("replacing")
  #     String.replace(key, "playerI", gameui["game"]["playerUi"]["playerN"])
  #   else key end
  #   IO.puts("process_key 2")
  #   IO.inspect(key)

  #   case key do
  #     "sideUp" ->
  #       IO.puts("sideUp translate")
  #       IO.inspect(parent)
  #       parent["currentSide"]
  #     "sideDown" ->
  #       opposite_side(parent["currentSide"])
  #     _ ->
  #       key
  #   end
  # end

  # def process_change(obj, parent, gameui, key_list, operation, options) do
  #   IO.puts("process_change")
  #   IO.inspect(operation)
  #   IO.inspect(key_list)
  #   IO.inspect(options)
  #   # A change is [key_list (list), operation (string), options (map)]
  #   case Enum.count(key_list) do
  #     0 ->
  #       process_operation(obj, operation, options)
  #     _ ->
  #       key = process_key(obj, parent, gameui, Enum.at(key_list,0))
  #       new_key_list = List.delete_at(key_list, 0)
  #       IO.puts("put in")
  #       IO.inspect(key)
  #       put_in(obj[key], process_change(obj[key], obj, gameui, new_key_list, operation, options))
  #   end
  # end

  # def process_operation(obj, operation, options) do
  #   IO.puts("process operation")
  #   IO.inspect(obj)
  #   IO.inspect(operation)
  #   IO.inspect(options)
  #   case operation do
  #     "setValue" ->
  #       if Map.has_key?(options, "value") do
  #         IO.puts("settingto")
  #         IO.inspect(options["value"])
  #         options["value"]
  #       else obj end
  #     "shuffle" ->
  #       if is_list(obj) do
  #         obj |> Enum.shuffle
  #       else obj end
  #     "increaseBy" ->
  #       if is_number(obj) and Map.has_key?(options, "value") do
  #         new_val = obj + options["value"]
  #         if Map.has_key?(options, "limit") do
  #           min(new_val, options["limit"])
  #         else new_val end
  #       else obj end
  #     "decreaseBy" ->
  #       if is_number(obj) and Map.has_key?(options, "value") do
  #         new_val = obj - options["value"]
  #         if Map.has_key?(options, "limit") do
  #           max(new_val, options["limit"])
  #         else new_val end
  #       else obj end
  #   end
  # end

  def get_hero_list(game, player_n) do
    criteria = [["sides","A","type","Hero"], ["owner",player_n], ["groupType","play"]]
    heroes_in_play = get_cards_matching_criteria(game, criteria)
    criteria = [["sides","A","type","Hero"], ["owner",player_n], ["groupId", player_n<>"Discard"]]
    heroes_in_discard = get_cards_matching_criteria(game, criteria)
    heroes_in_play ++ heroes_in_discard
  end

  def get_hero_names(game, player_n) do
    hero_list = get_hero_list(game, player_n)
    Enum.reduce(hero_list, [], fn(hero, acc) ->
      acc ++ [hero["sides"]["A"]["name"]]
    end)
  end

  def get_encounter_name(game) do
    criteria = [["sides","A","cost",1], ["sides","A","type","Quest"]]
    card_1As = get_cards_matching_criteria(game, criteria)
    if Enum.count(card_1As) > 0 do
      # Pick the first quest 1A found
      card_1A = Enum.at(card_1As, 0)
      encounter_name = card_1A["cardEncounterSet"]
      criteria = [["sides","A","type","Nightmare"]]
      card_nightmare = get_cards_matching_criteria(game, criteria)
      encounter_name = if Enum.count(card_nightmare) > 0 do
        encounter_name <> " - Nightmare"
      else
        encounter_name
      end
    else
      ""
    end
  end

  def save_replay(game, user_id) do
    game_uuid = game["id"]
    num_players = game["numPlayers"]
    hero_1_names = get_hero_names(game, "player1")
    hero_2_names = get_hero_names(game, "player2")
    hero_3_names = get_hero_names(game, "player3")
    hero_4_names = get_hero_names(game, "player4")
    encounter_name = get_encounter_name(game)
    updates = %{
      encounter: encounter_name,
      rounds: game["roundNumber"],
      num_players: game["numPlayers"],
      player1_heroes: hero_1_names,
      player2_heroes: hero_2_names,
      player3_heroes: hero_3_names,
      player4_heroes: hero_4_names,
      game_json: game,
      outcome: game["victoryState"],
    }
    result =
      case Repo.get_by(Replay, [user: user_id, uuid: game_uuid]) do
        nil  -> %Replay{user: user_id, uuid: game_uuid} # Replay not found, we build one
        replay -> replay  # Replay exists, let's use it
      end
      |> Replay.changeset(updates)
      |> Repo.insert_or_update
    game
  end

  def set_last_update(gameui) do
    timestamp = System.system_time(:second)
    room = Repo.get_by(Room, [slug: gameui["gameName"]])
    if room do
      updates = %{
        last_update: timestamp,
        encounter_name: gameui["game"]["encounterName"],
        num_players: gameui["game"]["numPlayers"]
      }
      room
      |> Room.changeset(updates)
      |> Repo.insert_or_update
    end
    put_in(gameui["lastUpdate"], timestamp)
  end

  def step_through(game_old, size, direction) do
    game_new = cond do
      size == "single" ->
        Game.step(game_old, direction)
      size == "round" ->
        Game.apply_deltas_until_round_change(game_old, direction)
      true ->
        game_old
    end
  end

  def refresh(game, player_n) do
    is_host = player_n == leftmost_non_eliminated_player_n(game)
    # Set phase
    game = if is_host do
      update_values(game,[
        ["phase", "Refresh"],
        ["roundStep", "7.R"]
      ])
    else
      game
    end
    # Pass token
    game = if is_host do
      pass_first_player_token(game)
    else
      game
    end
    # Refresh all cards you control
    game = action_on_matching_cards(game, [
        ["locked", false],
        ["controller",player_n],
      ],
      "update_card_values",
      %{"updates" => [["exhausted", false], ["rotation", 0]]}
    )
    game = increment_threat(game, player_n, 1)
    # Set refreshed status
    game = update_values(game, [["playerData", player_n, "refreshed", true]]);
  end

  def new_round(game, player_n, user_id) do
    # Change phase and round
    is_host = player_n == leftmost_non_eliminated_player_n(game)
    game = if is_host do
      update_values(game,[
        ["phase", "Resource"],
        ["roundStep", "1.R"],
        ["roundNumber", game["roundNumber"]+1]
      ])
    else
      game
    end
    # Draw card(s)
    cards_per_round = game["playerData"][player_n]["cardsDrawn"]
    game = if cards_per_round > 0 do Enum.reduce(1..cards_per_round, game, fn(n, acc) ->
        acc = draw_card(acc, player_n)
      end)
    else
      game
    end
    # Add a resource to each hero
    game = action_on_matching_cards(game, [
        ["sides","sideUp","type","Hero"],
        ["controller",player_n],
        ["groupType","play"]
      ],
      "increment_token",
      %{"token_type" => "resource", "increment" => 1}
    )
    # Reset willpower count and refresh status
    game = update_values(game,[
      ["playerData", player_n, "willpower", 0],
      ["playerData", player_n, "refreshed", false]
    ])
    # Add custom set tokens per round
    game = action_on_matching_cards(game, [
        ["controller",player_n],
        ["groupType","play"]
      ],
      "apply_tokens_per_round",
      %{}
    );
    if is_host do game = action_on_matching_cards(game, [
          ["controller","shared"],
          ["groupType","play"]
        ],
        "apply_tokens_per_round",
        %{}
      );
    else
      game
    end
    # Uncommit all characters to the quest
    game = action_on_matching_cards(game, [
        ["controller",player_n]
      ],
      "update_card_values",
      %{"updates" => [["committed", false]]}
    );
    # Save replay
    game = save_replay(game, user_id);
  end

  def refresh_and_new_round(game, player_n, user_id) do
    game
    |> refresh(player_n)
    |> new_round(player_n, user_id)
  end

  def draw_card(game, player_n) do
    stack_ids = get_stack_ids(game, player_n<>"Deck")
    if Enum.count(stack_ids) > 0 do
      move_stack(game, Enum.at(stack_ids, 0), player_n<>"Hand", -1)
    else
      game
    end
  end

  def increment_threat(game, player_n, increment) do
    current_threat = game["playerData"][player_n]["threat"]
    new_threat = current_threat + increment
    new_threat = if new_threat < 0 do 0 else new_threat end
    put_in(game["playerData"][player_n]["threat"], new_threat)
  end

  def reset_game(game) do
    Game.new(game["options"])
  end

  def reveal_encounter(game, player_n, options) do
    stack_ids = get_stack_ids(game, "sharedEncounter")
    if Enum.count(stack_ids) > 0 do
      move_stack(game, Enum.at(stack_ids, 0), "sharedStaging", -1)
    else
      game
    end
  end

  def rotate_list_left(list) do
    nl = if Enum.count(list) > 0 do
      Enum.slice(list, 1, Enum.count(list)) ++ [Enum.at(list,0)]
    else
      []
    end
  end

  def get_non_eliminated_players(game) do
    Enum.reduce(1..game["numPlayers"], [], fn(n, acc) ->
      player_n = "player"<>Integer.to_string(n)
      acc = if game["playerData"][player_n]["eliminated"] do
        acc
      else
        acc ++ [player_n]
      end
    end)
  end

  def get_player_order(game) do
    # Get list of non-eliminated players
    players = get_non_eliminated_players(game)
    # Rotate list until first player is first
    Enum.reduce_while(players, players, fn(player_n, acc) ->
      if game["firstPlayer"] == Enum.at(acc, 0) do
        {:halt, acc}
      else
        {:cont, rotate_list_left(acc)}
      end
    end)
  end

  def deal_player_n_shadows(game, player_n) do
    # Get engaged enemy cards
    criteria = [["groupId", player_n<>"Engaged"], ["cardIndex", 0], ["sides", "sideUp", "type", "Enemy"]]
    engaged_enemy_cards = get_cards_matching_criteria(game, criteria)
    # Get list of engagements costs
    engagement_cost_list = Enum.reduce(engaged_enemy_cards, [], fn(card, acc)->
      engagement_cost = get_value_from_cardpath(card, ["sides", "sideUp", "engagementCost"])
      acc = acc ++ [%{"engagement_cost" => engagement_cost, "id" => card["id"]}]
    end)
    # Sort by engagement cost
    sorted_enemy_list = Enum.reverse(Enum.sort_by(engagement_cost_list, &Map.fetch(&1, "engagement_cost")))
    # Deal shadows
    Enum.reduce(sorted_enemy_list, game, fn(item, acc) ->
      acc = deal_shadow(acc, item["id"])
    end)
  end

  def deal_all_shadows(game) do
    player_order = get_player_order(game)
    Enum.reduce(player_order, game, fn(player_n, acc) ->
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

  def update_values(game, updates) do
    Enum.reduce(updates, game, fn(update, acc) ->
      acc = update_value(acc, update)
    end)
  end


  def shuffle_group(game, group_id) do
    shuffled_stack_ids = get_stack_ids(game, group_id) |> Enum.shuffle
    update_stack_ids(game, group_id, shuffled_stack_ids)
  end

  def get_player_n(game, user_id) do
    info = game["playerInfo"]
    if user_id == nil do
      nil
    else
      cond do
        info["player1"]["id"] == user_id -> "player1"
        info["player2"]["id"] == user_id -> "player2"
        info["player3"]["id"] == user_id -> "player3"
        info["player4"]["id"] == user_id -> "player4"
        true -> nil
      end
    end
  end

  def add_card_row_to_group(game, group_id, card_row) do
    controller = get_group_controller(game, group_id)
    group_size = Enum.count(get_stack_ids(game, group_id))
    # Can't insert a card directly into a group need to make a stack first
    new_card = Card.card_from_cardrow(card_row, controller)
    new_stack = Stack.stack_from_card(new_card)
    game
    |> insert_stack_in_group(group_id, new_stack["id"], group_size)
    |> update_stack(new_stack)
    |> update_card(new_card)
    |> update_card_state(new_card["id"], false, "sharedEncounterDeck")
  end

  def load_card(game, card_row, group_id, quantity) do
    type = card_row["sides"]["A"]["type"]
    if quantity > 0 do
      Enum.reduce(1..quantity, game, fn(index, acc) ->
        stack_ids = get_stack_ids(game, group_id)
        acc = add_card_row_to_group(acc, group_id, card_row)
      end)
    else
      game
    end
  end

  def shuffle_changed_decks(old_game, new_game) do
    group_by_id = new_game["groupById"]
    Enum.reduce(group_by_id, new_game, fn({group_id, group}, acc) ->
      # Check if the number of stacks in the deck has changed, and if so, we shuffle
      old_stack_ids = get_stack_ids(old_game, group_id)
      new_stack_ids = get_stack_ids(new_game, group_id)
      acc = if group["type"] == "deck" and Enum.count(old_stack_ids) != Enum.count(new_stack_ids) do
        shuffle_group(acc, group_id)
      else
        acc
      end
    end)
  end

  def load_cards(game, player_n, load_list) do
    # Get deck size before load
    player_n_deck_id = player_n<>"Deck"
    deck_size_before = Enum.count(get_stack_ids(game, player_n_deck_id))
    old_game = game

    game = Enum.reduce(load_list, game, fn r, acc ->
      load_card(acc, r["cardRow"], r["groupId"], r["quantity"])
    end)

    # Check if we should load the first quest card
    main_quest_stack_ids = get_stack_ids(game, "sharedMainQuest")
    quest_deck_stack_ids = get_stack_ids(game, "sharedQuestDeck")
    game = if Enum.count(quest_deck_stack_ids)>0 && Enum.count(main_quest_stack_ids)==0 do
      # Dump nightmare/campaign cards into staging
      game = Enum.reduce_while(quest_deck_stack_ids, game, fn(stack_id, acc) ->
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
      game
    end
    # Update encounter name
    game = put_in(game["encounterName"], get_encounter_name(game))

    # Calculate threat cost
    threat = Enum.reduce(load_list, 0, fn(r, acc) ->
      sideA = r["cardRow"]["sides"]["A"]
      if sideA["type"] == "Hero" && r["groupId"] == player_n<>"Play1" && game["roundNumber"] == 0 do
        acc + CardFace.convert_to_integer(sideA["cost"])*r["quantity"]
      else
        acc
      end
    end)
    # Add to starting threat
    current_threat = game["playerData"][player_n]["threat"]
    game = put_in(game["playerData"][player_n]["threat"], current_threat + threat)

    # If deck size has increased from 0, assume it is at start of game and a draw of 6 is needed
    round_number = game["roundNumber"]
    round_step = game["roundStep"]
    deck_size_after = Enum.count(get_stack_ids(game, player_n_deck_id))

    # Shuffle decks with new cards
    game = shuffle_changed_decks(old_game, game)

    # Check if a hand needs to be drawn
    game = if round_number == 0 && round_step == "0.0" && deck_size_before == 0 && deck_size_after > 6 do
      Enum.reduce(1..6, game, fn(i, acc) ->
        stack_ids = get_stack_ids(acc, player_n_deck_id)
        acc = move_stack(acc, Enum.at(stack_ids, 0), player_n<>"Hand", -1)
      end)
    else
      game
    end
  end

  # Obtain a flattened list of all cards in the game, where each card has the additional keys group_id, stack_index, and card_index
  def flat_list_of_cards(game) do
    card_by_id = game["cardById"]
    all_cards = Enum.reduce(card_by_id, [], fn({card_id, card}, acc) ->
      my_gsc = gsc(game, card_id)
      {group_id, stack_index, card_index} = my_gsc
      group_type = get_group_type(game, group_id)
      stack = get_stack_by_card_id(game, card_id)
      card = Map.merge(card, %{"groupId" => group_id, "stackIndex" => stack_index, "stackId" => stack["id"], "cardIndex" => card_index, "groupType" => group_type})
      acc ++ [card]
    end)
  end

  # Criteria is a list like: [["sides","sideUp","type","Hero"], ["controller",playerN], ["groupType","play"]],
  def get_cards_matching_criteria(game, criteria) do
    flat_list = flat_list_of_cards(game)
    Enum.reduce(flat_list, [], fn(card, acc) ->
      acc = if passes_criteria(card, criteria) do
        acc ++ [card]
      else
        acc
      end
    end)
  end

  def action_on_matching_cards(game, criteria, action, options \\ nil) do
    flat_list = flat_list_of_cards(game)
    Enum.reduce(flat_list, game, fn(card, acc) ->
      acc = if passes_criteria(card, criteria) do
        card_action(acc, card["id"], action, options)
      else
        acc
      end
    end)
  end

  def next_player(game, player_n) do
    seated_player_ns = get_non_eliminated_players(game)
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
    next
  end

  def pass_first_player_token(game) do
    current_first_player = game["firstPlayer"]
    next_first_player = next_player(game, current_first_player)
    if !next_first_player do
      game
    else
      put_in(game["firstPlayer"], next_first_player)
    end
  end

  # List of PlayerN strings of players that are seated and not eliminated
  def seated_non_eliminated(game) do
    player_info = game["playerInfo"]
    player_data = game["playerData"]
    Enum.reduce(1..game["numPlayers"], [], fn(player_n, acc) ->
      acc = if player_info[player_n] && !player_data[player_n]["eliminated"] do
        acc ++ [player_n]
      else
        acc
      end
    end)
  end

  # Get leftmost player that is not elimiated. Useful for once per round actions like passing 1st player token so
  # that it doesn't get passed twice
  def leftmost_non_eliminated_player_n(game) do
    seated_player_ns = seated_non_eliminated(game)
    Enum.at(seated_player_ns,0) || "player1"
  end

  # Increment a player's threat
  def increment_threat(game, player_n, increment) do
    current_threat = game["playerData"][player_n]["threat"];
    put_in(game["playerData"][player_n]["threat"], current_threat + increment)
  end

  # Increment a player's willpower
  def increment_willpower(game, player_n, increment) do
    current_willpower = game["playerData"][player_n]["willpower"];
    if increment do
      put_in(game["playerData"][player_n]["willpower"], current_willpower + increment)
    else
      game
    end
  end

end
