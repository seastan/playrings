defmodule DragnCards.Plugins.Plugin do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:game_def, :card_db]}

  schema "plugins" do
    field :card_db, :map
    field :game_def, :map
    field :name, :string
    field :num_favorites, :integer, default: 0
    field :public, :boolean, default: false
    field :version, :integer, default: 1
    field :author_id, :id

    timestamps()
  end

  @doc false
  def changeset(plugin, attrs) do
    IO.puts("plugin changeset 1")
    plugin = plugin
    |> cast(attrs, [:name, :version, :game_def, :card_db, :num_favorites, :public, :author_id])
    IO.puts("plugin changeset 2")
    plugin = plugin
    |> validate_required([:name, :version, :game_def, :card_db, :num_favorites, :public, :author_id])
    IO.puts("plugin changeset 3")
    plugin
  end
end
