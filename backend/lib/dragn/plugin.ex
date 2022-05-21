defmodule DragnCards.Plugin do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query

  alias DragnCards.{Plugin, Repo}

  @derive {Jason.Encoder, only: [:game_def, :card_db]}

  schema "plugins" do

    field :author_user_id, :integer
    field :author_alias, :string
    field :plugin_uuid, :string
    field :plugin_name, :string
    field :version, :integer
    field :game_def, :map
    field :card_db, :map
    field :num_favorites, :integer
    field :public, :boolean

    timestamps()
  end

  def changeset(replay, params \\ %{}) do
    replay
    |> cast(params, [:author_user_id, :author_alias, :plugin_uuid, :plugin_name, :version, :game_def, :card_db, :num_favorites, :public])
  end

  def list_plugins do
    query = from Plugin, order_by: [desc: :version], where: [public: true], select: [:author_user_id, :author_alias, :plugin_uuid, :plugin_name, :version, :num_favorites, :public]
    Repo.all(query)
  end

  def get_by_uuid_and_version(plugin_uuid, version) do
    Plugin
    |> Repo.get_by([plugin_uuid: plugin_uuid, version: version])
  end

  def get_game_def_by_uuid_and_version(plugin_uuid, version) do
    plugin = get_by_uuid_and_version(plugin_uuid, version)
    plugin.game_def
  end
end
