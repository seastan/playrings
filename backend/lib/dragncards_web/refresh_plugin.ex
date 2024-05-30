defmodule DragnCardsWeb.RefreshPlugin do
  @moduledoc """
  Handle refreshing the plugin.
  """

  def refresh do
    IO.puts("Refreshing plugin...")
    file_path = "/tmp/plugin_jsons"

    files = fetch_json_files(file_path)
    files = Enum.map(files, fn file -> process_file(file) end)
    {:ok, files}
  end


  defp fetch_json_files(dir) do
    dir
    |> Path.expand()
    |> File.ls!()
    |> Enum.flat_map(fn file ->
      full_path = Path.join(dir, file)
      if File.dir?(full_path) do
        fetch_json_files(full_path)
      else
        if String.ends_with?(file, ".json"), do: [full_path], else: []
      end
    end)
  end

  defp process_file(file_path) do
    case File.read(file_path) do
      {:ok, content} ->
        # Process the JSON file content
        json_content = Jason.decode!(content)


      {:error, reason} ->
        IO.puts("Failed to read file #{file_path}: #{reason}")
    end
  end
end
