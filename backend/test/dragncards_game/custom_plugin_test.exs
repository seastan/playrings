# NOTE: This files is specific to the LotR LCG plugin. You must copy this file to a new file that is not tracked by git and edit it to match your plugin.

# This test file can be run via:
# cd backend
# export PLUGIN_JSON_PATH=/path/to/directory/containing/your/plugin/jsons/
# export PLUGIN_TSV_PATH=/path/to/directory/containing/your/plugin/tsvs/
# mix test test/dragncards_game/custom_plugin_test.exs

defmodule DragnCardsGame.CustomPluginTest do
  # ExUnit.Case module brings the functionality for testing in Elixir
  # async: true runs the tests concurrently
  use ExUnit.Case, async: true

  # Include DragnCardsWeb.ConnCase for web related tests
  use DragnCardsWeb.ConnCase

  # Create aliases for the different modules used in this file
  alias DragnCards.{Plugins, Plugins.Plugin, Repo}
  alias DragnCards.Users.User
  alias DragnCardsGame.{GameUI, Game, Evaluate}
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
        IO.inspect(user)

        # Confirm the user's email by setting the confirmation time
        confirm_time = DateTime.utc_now()

        # Update the user's email confirmed time in the database
        output =
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
  test "Loading Decks", %{user: user, game: game} do

    # Load some decks into the game
    game = Evaluate.evaluate(game, ["LOAD_CARDS", "Q01.1"]) # Passage through Mirkwood
    game = Evaluate.evaluate(game, ["LOAD_CARDS", "coreLeadership"]) # Leadership core set deck

    # Get the number of cards in sharedStagingArea, assert that it equals 2
    assert length(game["groupById"]["sharedStagingArea"]["stackIds"]) == 2

    # Get the number of cards in player1Play1, assert that it equals 3
    assert length(game["groupById"]["player1Play1"]["stackIds"]) == 3

    # Get the number of cards in player1Hand, assert that it equals 6
    assert length(game["groupById"]["player1Hand"]["stackIds"]) == 6

    # Confirm starting threat
    assert game["playerData"]["player1"]["threat"] == 29

  end

  test "Card Hotkeys", %{user: user, game: game, game_def: game_def} do

    # Load some decks into the game
    game = Evaluate.evaluate(game, ["LOAD_CARDS", "Q01.1"]) # Passage through Mirkwood
    game = Evaluate.evaluate(game, ["LOAD_CARDS", "coreLeadership"]) # Leadership core set deck

    # Get one of the cards
    aragorn_card_db_id = "51223bd0-ffd1-11df-a976-0801200c9001"
    aragorn_card = Evaluate.evaluate(game, ["ONE_CARD", "$CARD", ["EQUAL", "$CARD.cardDbId", aragorn_card_db_id]])
    aragorn_card_id = aragorn_card["id"]

    # Make it active
    game = put_in(game["playerUi"]["activeCardId"], aragorn_card_id)

    # Test out hotkeys

    # flipCard
    IO.puts("Testing flipCard")
    res = Evaluate.evaluate(game, game_def["actionLists"]["flipCard"])
    assert res["cardById"][aragorn_card_id]["currentSide"] == "B"
    res = Evaluate.evaluate(res, game_def["actionLists"]["flipCard"])
    assert res["cardById"][aragorn_card_id]["currentSide"] == "A"

    # drawCard
    IO.puts("Testing drawCard")
    res = Evaluate.evaluate(game, game_def["actionLists"]["drawCard"])
    assert length(res["groupById"]["player1Hand"]["stackIds"]) == 7

    # revealEncounterFaceup
    IO.puts("Testing revealEncounterFaceup")
    res = Evaluate.evaluate(game, game_def["actionLists"]["revealEncounterFaceup"])
    assert length(res["groupById"]["sharedStagingArea"]["stackIds"]) == 3
    card = GameUI.get_card_by_group_id_stack_index_card_index(res, ["sharedStagingArea", 2, 0])
    assert card["currentSide"] == "A"

    # revealEncounterFacedown
    IO.puts("Testing revealEncounterFacedown")
    res = Evaluate.evaluate(game, game_def["actionLists"]["revealEncounterFacedown"])
    assert length(res["groupById"]["sharedStagingArea"]["stackIds"]) == 3
    card = GameUI.get_card_by_group_id_stack_index_card_index(res, ["sharedStagingArea", 2, 0])
    assert card["currentSide"] == "B"

    # mulligan
    IO.puts("Testing mulligan")
    res = Evaluate.evaluate(game, game_def["actionLists"]["mulligan"])
    assert length(game["groupById"]["player1Hand"]["stackIds"]) == 6

    # newRound
    IO.puts("Testing newRound")
    res = Evaluate.evaluate(game, game_def["actionLists"]["newRound"])
    assert length(res["groupById"]["player1Hand"]["stackIds"]) == 7
    assert GameUI.get_card_by_group_id_stack_index_card_index(res, ["player1Play1", 0, 0])["tokens"]["resource"] == 1
    assert GameUI.get_card_by_group_id_stack_index_card_index(res, ["player1Play1", 1, 0])["tokens"]["resource"] == 1
    assert GameUI.get_card_by_group_id_stack_index_card_index(res, ["player1Play1", 2, 0])["tokens"]["resource"] == 1
    assert res["playerData"]["player1"]["threat"] == 29 # first time doing newRound doesn't increase threat
    assert res["roundNumber"] == 1

    IO.puts("Testing newRound again")
    res = Evaluate.evaluate(res, game_def["actionLists"]["newRound"])
    assert length(res["groupById"]["player1Hand"]["stackIds"]) == 8
    assert GameUI.get_card_by_group_id_stack_index_card_index(res, ["player1Play1", 0, 0])["tokens"]["resource"] == 2
    assert GameUI.get_card_by_group_id_stack_index_card_index(res, ["player1Play1", 1, 0])["tokens"]["resource"] == 2
    assert GameUI.get_card_by_group_id_stack_index_card_index(res, ["player1Play1", 2, 0])["tokens"]["resource"] == 2
    assert res["playerData"]["player1"]["threat"] == 30
    assert res["roundNumber"] == 2

  end
end
