# NOTE: This files is specific to the Marvel Champions plugin. You must copy this file to a new file that is not tracked by git and edit it to match your plugin.

# This test file can be run via:
# cd backend
# export PLUGIN_JSON_PATH=/path/to/directory/containing/your/plugin/jsons/
# export PLUGIN_TSV_PATH=/path/to/directory/containing/your/plugin/tsvs/
# mix test test/dragncards_game/mc_plugin_test.exs

defmodule DragnCardsGame.McPluginTest do
  # ExUnit.Case module brings the functionality for testing in Elixir
  # async: true runs the tests concurrently
  use ExUnit.Case, async: true

  # Include DragnCardsWeb.ConnCase for web related tests
  use DragnCardsWeb.ConnCase

  # Create aliases for the different modules used in this file
  alias DragnCards.{Plugins, Repo}
  alias DragnCards.Users.User
  alias DragnCardsGame.{GameUI, Evaluate}
  alias Jason

  # Import Ecto.Query for database related operations
  import Ecto.Query

  # Import ExUnit.Callbacks for callback functionality in tests
  import ExUnit.Callbacks

  # Import helper functions
  alias DragnCardsUtil.{Merger}
  alias DragnCardsUtil.{TsvProcess}

  # Setup block for the tests, executed before each test run
  # NOTE: You shouldn't have to edit this setup block for your plugin.
  # It will create a test user and a test game for you to use in your tests.
  setup do
    # User attributes for creating a test user
    user_attrs = %{
      alias: "dev_user",
      email: "dev_user@example.com",
      password: "password",
      password_confirmation: "password",
      supporter_level: 1,
      language: "English",
      plugin_settings: %{}
    }

    # Create a changeset for user creation
    changeset = User.changeset(%User{}, user_attrs)

    # Try to insert the user into the database
    case Repo.insert(changeset) do
      {:ok, user} ->
        # If the user was inserted successfully, print and inspect the user
        IO.puts("User created successfully!")

        # Confirm the user's email by setting the confirmation time
        confirm_time = DateTime.utc_now()

        # Update the user's email confirmed time in the database
        from(p in User,
          where: p.id == ^user.id,
          update: [set: [email_confirmed_at: ^confirm_time]]
        )
        |> Repo.update_all([])
        |> case do
          {1, nil} ->
            # If the update was successful, print a confirmation message
            IO.puts("Email Confirmed for user!")

          _ ->
            # If the update was not successful, print a failure message
            IO.puts("Email NOT Confirmed for user!")
        end

      {:error, changeset} ->
        # If the user creation failed, print and inspect the errors
        IO.puts("Failed to create user:")
        IO.inspect(changeset.errors)
    end

    # Retrieve the created user
    user = Repo.one(from u in User, limit: 1)

    # Set up plugin JSON paths
    plugin_json_path = System.get_env("PLUGIN_JSON_PATH")
    #plugin_json_path = Application.get_env(:dragncards, :plugin_json_path)

    # Get list of all JSON files from the plugin_json_path
    filenames = Path.wildcard(Path.join(plugin_json_path, "*.json"))

    # Merge all JSON files
    game_def = Merger.merge_json_files(filenames)

    # Get list of .tsv files from plugin_tsv_path
    plugin_tsv_path = System.get_env("PLUGIN_TSV_PATH")
    filenames = Path.wildcard(Path.join(plugin_tsv_path, "*.tsv"))

    # Process each .tsv file and merge them into a card_db
    card_db = Enum.reduce(filenames, %{}, fn(filename, acc) ->
      IO.puts("Processing #{filename}")
      rows = File.stream!(filename)
      |> Stream.map(&String.split(&1, "\t"))
      |> Enum.to_list()

      temp_db = TsvProcess.process_rows(game_def, rows)
      Merger.deep_merge([acc, temp_db])
    end)

    # Plugin parameters for creation
    plugin_params = %{
      "name" => game_def["pluginName"],
      "author_id" => user.id,
      "game_def" => game_def,
      "card_db" => card_db,
      "public" => true,
    }

    # Create a plugin
    Plugins.create_plugin(plugin_params)

    # Retrieve the created plugin and print its name
    plugin = Repo.one(from p in Plugins.Plugin, limit: 1)
    IO.puts("Plugin: #{plugin.name}")

    # Create a game with given options
    options = %{
      "privacyType" => "public",
      "pluginId" => plugin.id,
      "pluginVersion" => plugin.version,
      "language" => "English"
    }

    # Create a new game UI with options
    gameui = GameUI.new("room-slug-1234", user.id, options)

    # Extract the game from the game UI
    game = gameui["game"]

    # Set the player UI for the game
    player_ui = %{
      "activeCardId" => "",
      "playerN" => "player1"
    }

    # Update the game state with the player UI
    game = game |> put_in(["playerUi"], player_ui)

    # Return the setup data to be used in tests
    {:ok, %{user: user, game: game, game_def: plugin.game_def, card_db: plugin.card_db}}
  end

  # These tests are plugin-specific. You will need to overwite them, but they are here as a starting point.
  test "Loading Decks", %{user: _user, game: game, game_def: game_def} do

    # Load some decks into the game
    res = Evaluate.evaluate(game, ["LOAD_CARDS", "Phoenix"])

    # Check that the deck was loaded
    assert length(res["groupById"]["player1Identity"]["stackIds"]) == 1
    assert length(res["groupById"]["player1Play1"]["stackIds"]) == 1

    # Check hand size limit
    assert res["playerData"]["player1"]["handSize"] == 6

    # Check hit points
    assert res["playerData"]["player1"]["hitPoints"] == 9

    # Check number of cards in hand
    assert length(res["groupById"]["player1Hand"]["stackIds"]) == 6

    # Get Jean Grey
    card_db_id = "2c1d1f38-fe42-504d-9e70-b0112062f399"
    card = Evaluate.evaluate(res, ["ONE_CARD", "$CARD", ["EQUAL", "$CARD.databaseId", card_db_id]])

    card_id = card["id"]
    assert res["cardById"][card_id]["currentSide"] == "A"

    # Make it active
    res = put_in(res["playerUi"]["activeCardId"], card_id)

    # Flip the card
    res = Evaluate.evaluate(res, game_def["actionLists"]["flipCard"])
    assert res["cardById"][card_id]["currentSide"] == "B"
    assert res["playerData"]["player1"]["handSize"] == 5
    res = Evaluate.evaluate(res, game_def["actionLists"]["flipCard"])
    assert res["cardById"][card_id]["currentSide"] == "A"
    assert res["playerData"]["player1"]["handSize"] == 6

    # Load an encounter deck
    res = Evaluate.evaluate(res, ["LOAD_CARDS", "Thanos"])

    # Confirm encounter deck
    assert length(res["groupById"]["sharedEncounterDeck"]["stackIds"]) == 15

    # Reveal encounter card
    res = Evaluate.evaluate(res, game_def["actionLists"]["revealEncounterFaceup"])
    assert length(res["groupById"]["player1Engaged"]["stackIds"]) == 1
    assert length(res["groupById"]["sharedEncounterDeck"]["stackIds"]) == 14

    # Check exhaust/ready
    res = Evaluate.evaluate(res, game_def["actionLists"]["toggleExhaust"])
    assert res["cardById"][card_id]["exhausted"] == true
    assert res["cardById"][card_id]["rotation"] == 90
    res = Evaluate.evaluate(res, game_def["actionLists"]["toggleExhaust"])
    assert res["cardById"][card_id]["exhausted"] == false
    assert res["cardById"][card_id]["rotation"] == 0

    # Check drawCard
    res = Evaluate.evaluate(res, game_def["actionLists"]["drawCard"])
    assert length(res["groupById"]["player1Hand"]["stackIds"]) == 7

    # Move a card in hand to the table
    card_from_hand = GameUI.get_card_by_group_id_stack_index_card_index(res, ["player1Hand", 0, 0])
    res = Evaluate.evaluate(res, ["MOVE_CARD", card_from_hand["id"], "player1Play1", -1])
    assert length(res["groupById"]["player1Hand"]["stackIds"]) == 6

    # Make it active
    res = put_in(res["playerUi"]["activeCardId"], card_from_hand["id"])

    # Check shuffleIntoDeck
    deck_size_before = length(res["groupById"]["player1Deck"]["stackIds"])
    res = Evaluate.evaluate(res, game_def["actionLists"]["shuffleIntoDeck"])
    deck_size_after = length(res["groupById"]["player1Deck"]["stackIds"])
    assert deck_size_after == deck_size_before + 1

  end

  test "player setup", %{user: user, game: game, game_def: game_def} do
    res = Evaluate.evaluate(game, ["LOAD_CARDS", "Captain America"])

    assert res["playerData"]["player1"]["handSize"] == 6
    assert res["playerData"]["player1"]["hitPoints"] == 11
    assert length(res["groupById"]["player1Hand"]["stackIds"])
  end

  test "scenario setup (standard)", %{user: user, game: game, game_def: game_def} do
    res = Evaluate.evaluate(game, ["LOAD_CARDS", "Brotherhood of Badoon"])

    assert res["villainHitPoints"] == 13

    stacks = res["groupById"]["sharedMainScheme"]["stackIds"]
    card_id = hd(res["stackById"][hd(stacks)]["cardIds"])
    assert res["cardById"][card_id]["tokens"]["threat"] == 2

    Enum.each %{"sharedMainScheme" => "1A", "sharedVillain" => "I", "sharedVillainDeck" => "II", "sharedVillainDiscard" => "III"}, fn {group, stage} ->
      stacks = res["groupById"][group]["stackIds"]
      assert length(stacks) == 1
      card_id = hd(res["stackById"][hd(stacks)]["cardIds"])
      assert res["cardById"][card_id]["sides"]["A"]["stage"] == stage
    end
  end

  test "scenario setup (expert)", %{user: user, game: game, game_def: game_def} do
    res = Evaluate.evaluate(game, game_def["actionLists"]["setExpertMode"])
    res = Evaluate.evaluate(res, ["LOAD_CARDS", "Rhino"])

    assert res["villainHitPoints"] == 15

    Enum.each %{"sharedVillain" => "II", "sharedVillainDeck" => "III", "sharedVillainDiscard" => "I"}, fn {group, stage} ->
      stacks = res["groupById"][group]["stackIds"]
      assert length(stacks) == 1
      card_id = hd(res["stackById"][hd(stacks)]["cardIds"])
      assert res["cardById"][card_id]["sides"]["A"]["stage"] == stage
    end
  end

  test "scenario setup (standard): double sided villain, single stage", %{user: user, game: game, game_def: game_def} do
    res = Evaluate.evaluate(game, ["LOAD_CARDS", "Escape the Museum"])

    assert res["villainHitPoints"] == 8

    stacks = res["groupById"]["sharedVillain"]["stackIds"]
    assert length(stacks) == 1
    card_id = hd(res["stackById"][hd(stacks)]["cardIds"])
    assert res["cardById"][card_id]["sides"]["A"]["stage"] == "A1"

    stacks = res["groupById"]["sharedVillainDeck"]["stackIds"]
    assert length(stacks) == 0

    stacks = res["groupById"]["sharedVillainDiscard"]["stackIds"]
    assert length(stacks) == 1
    card_id = hd(res["stackById"][hd(stacks)]["cardIds"])
    assert res["cardById"][card_id]["sides"]["A"]["stage"] == "B1"
  end

  test "scenario setup (expert): double sided villain, single stage", %{user: user, game: game, game_def: game_def} do
    res = Evaluate.evaluate(game, game_def["actionLists"]["setExpertMode"])
    res = Evaluate.evaluate(res, ["LOAD_CARDS", "Escape the Museum"])

    assert res["villainHitPoints"] == 10

    stacks = res["groupById"]["sharedVillain"]["stackIds"]
    assert length(stacks) == 1
    card_id = hd(res["stackById"][hd(stacks)]["cardIds"])
    assert res["cardById"][card_id]["sides"]["A"]["stage"] == "B1"

    stacks = res["groupById"]["sharedVillainDeck"]["stackIds"]
    assert length(stacks) == 0

    stacks = res["groupById"]["sharedVillainDiscard"]["stackIds"]
    assert length(stacks) == 1
    card_id = hd(res["stackById"][hd(stacks)]["cardIds"])
    assert res["cardById"][card_id]["sides"]["A"]["stage"] == "A1"
  end

  test "discard villain card", %{user: user, game: game, game_def: game_def} do
    res = Evaluate.evaluate(game, ["LOAD_CARDS", "Rhino"])

    stacks = res["groupById"]["sharedVillain"]["stackIds"]
    card_id = hd(res["stackById"][hd(stacks)]["cardIds"])
    res = put_in(res["playerUi"]["activeCardId"], card_id)

    res = Evaluate.evaluate(res, game_def["actionLists"]["discardCard"])

    stacks = res["groupById"]["sharedVillain"]["stackIds"]
    assert length(stacks) == 1
    card_id = hd(res["stackById"][hd(stacks)]["cardIds"])
    assert res["cardById"][card_id]["sides"]["A"]["stage"] == "II"

    stacks = res["groupById"]["sharedVillainDeck"]["stackIds"]
    assert length(stacks) == 0

    stacks = res["groupById"]["sharedVillainDiscard"]["stackIds"]
    assert length(stacks) == 2
  end

  test "discard main scheme card", %{user: user, game: game, game_def: game_def} do
    res = Evaluate.evaluate(game, ["LOAD_CARDS", "Brotherhood of Badoon"])

    stacks = res["groupById"]["sharedMainScheme"]["stackIds"]
    card_id = hd(res["stackById"][hd(stacks)]["cardIds"])
    res = put_in(res["playerUi"]["activeCardId"], card_id)

    res = Evaluate.evaluate(res, game_def["actionLists"]["discardCard"])

    stacks = res["groupById"]["sharedMainScheme"]["stackIds"]
    assert length(stacks) == 1
    card_id = hd(res["stackById"][hd(stacks)]["cardIds"])
    card = res["cardById"][card_id]
    assert card["sides"]["A"]["stage"] == "2A"
    assert card["tokens"]["threat"] == 4

    stacks = res["groupById"]["sharedMainSchemeDeck"]["stackIds"]
    assert length(stacks) == 0

    stacks = res["groupById"]["sharedVillainDiscard"]["stackIds"]
    assert length(stacks) == 1
  end

  test "3-sided cards", %{user: _user, game: game, game_def: game_def} do

    # Load some decks into the game
    res = Evaluate.evaluate(game, ["LOAD_CARDS", "Ant-Man"])

    # Check number of cards in hand
    assert length(res["groupById"]["player1Hand"]["stackIds"]) == 6


    # Ant-Man
    card = Evaluate.evaluate(res, ["ONE_CARD", "$CARD", ["EQUAL", "$CARD.sides.C.name", "Ant-Man"]])
    card_id = card["id"]
    assert res["cardById"][card_id]["currentSide"] == "B"

    # Make it active
    res = put_in(res["playerUi"]["activeCardId"], card_id)

    # Toggle third side
    res = Evaluate.evaluate(res, game_def["actionLists"]["setSideC"])
    assert res["cardById"][card_id]["currentSide"] == "C"

    # Toggle third side
    res = Evaluate.evaluate(res, game_def["actionLists"]["setSideB"])
    assert res["cardById"][card_id]["currentSide"] == "B"
  end

  @tag :reshuffle_when_empty
  test "Reshuffle encounter deck when empty", %{user: _user, game: game, game_def: _game_def} do

    # Load some decks into the game
    game = Evaluate.evaluate(game, ["LOAD_CARDS", "Rhino"])

    # Get number of encounter cards
    encounter_deck_size = length(game["groupById"]["sharedEncounterDeck"]["stackIds"])

    # Reveal and discard cards until the deck is empty
    game = Enum.reduce(game["groupById"]["sharedEncounterDeck"]["stackIds"], game, fn(_stack_id, acc) ->
      acc = Evaluate.evaluate(acc, ["ACTION_LIST", "revealEncounterFacedown"])
      Evaluate.evaluate(acc, [
        ["DEFINE", "$ACTIVE_CARD_ID", ["GET_CARD_ID", "player1Engaged", 0, 0]],
        ["ACTION_LIST", "discardCard"]
      ])
    end)

    # Check the the deck is full again, less 1 card for the last revealed card
    assert length(game["groupById"]["sharedEncounterDeck"]["stackIds"]) == encounter_deck_size - 1

    # Check that the discard pile has 1 card in it
    assert length(game["groupById"]["sharedEncounterDiscard"]["stackIds"]) == 1

  end


  @tag :reshuffle_after_discard
  test "Reshuffle encounter deck after_discard", %{user: _user, game: game, game_def: _game_def} do

    # Load some decks into the game
    game = Evaluate.evaluate(game, ["LOAD_CARDS", "Rhino"])

    # Get number of encounter cards
    encounter_deck_size = length(game["groupById"]["sharedEncounterDeck"]["stackIds"])

    # Discard cards until the deck is empty
    game = Enum.reduce(game["groupById"]["sharedEncounterDeck"]["stackIds"], game, fn(_stack_id, acc) ->
      Evaluate.evaluate(acc, [
        ["DEFINE", "$ACTIVE_CARD_ID", ["GET_CARD_ID", "sharedEncounterDeck", 0, 0]],
        ["ACTION_LIST", "discardCard"]
      ])
    end)

    # Check the the deck is full again
    assert length(game["groupById"]["sharedEncounterDeck"]["stackIds"]) == encounter_deck_size

  end

end
