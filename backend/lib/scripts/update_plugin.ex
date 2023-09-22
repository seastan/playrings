{:ok, _} = Application.ensure_all_started(:dragncards)

defmodule DragnCardsGame.UpdatePluginForExistingUserScript do
  alias DragnCards.{Repo, Plugins, Plugins.Plugin}
  alias DragnCards.Users.User
  alias Ecto.Multi
  import Ecto.Query
  # Import helper functions
  alias DragnCardsUtil.{Merger}
  alias DragnCardsUtil.{TsvProcess}


  defp get_existing_user(user_alias) do
    # Get all users
    all = Repo.all(from u in User, select: u.alias)
    IO.inspect(all)
    case Repo.get_by(User, alias: user_alias) do
      nil -> {:error, "User not found"}
      user -> {:ok, user}
    end
  end

  defp get_existing_plugin(plugin_name) do
    case Repo.get_by(Plugin, name: plugin_name) do
      nil -> {:error, "Plugin not found"}
      plugin -> {:ok, plugin}
    end
  end

  def run do
    Repo.transaction(fn ->
      case get_existing_user("dev_user") do
        {:ok, user} ->
          case get_existing_plugin("LotR Living Card Game") do
            {:ok, plugin} ->
              # Set up plugin JSON paths
              plugin_json_path = System.get_env("PLUGIN_JSON_PATH")

              # Get list of all JSON files from the plugin_json_path
              filenames = Path.wildcard(Path.join(plugin_json_path, "*.json"))

              # Merge all JSON files
              game_def = Merger.merge_json_files(filenames)

              # Get list of .tsv files from plugin_tsv_path
              plugin_tsv_path = System.get_env("PLUGIN_TSV_PATH")
              filenames = Path.wildcard(Path.join(plugin_tsv_path, "*.tsv"))

              # Process each .tsv file and merge them into a card_db
              card_db = Enum.reduce(filenames, %{}, fn(filename, acc) ->
                #IO.puts("Processing #{filename}")
                rows = File.stream!(filename)
                |> Stream.map(&String.split(&1, "\t"))
                |> Enum.to_list()

                temp_db = TsvProcess.process_rows(game_def, rows)
                Merger.deep_merge([acc, temp_db])
              end)

              # Plugin parameters for creation
              updated_params = %{
                "game_def" => game_def,
                "card_db" => card_db
              }
              IO.puts("Found plugin: #{plugin.name}")
              # updated_params = prepare_plugin(user, plugin)
              Plugins.update_plugin(plugin, updated_params)

            {:error, reason} ->
              IO.puts("Failed to find plugin. Reason: #{reason}")
          end

        {:error, reason} ->
          IO.puts("Failed to find user. Reason: #{reason}")
      end
    end)
  end
end

DragnCardsGame.UpdatePluginForExistingUserScript.run()
