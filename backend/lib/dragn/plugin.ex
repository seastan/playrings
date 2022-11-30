defmodule DragnCards.Plugin do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query

  alias DragnCards.{Plugin, Repo, Users.User}

  @derive {Jason.Encoder, only: [:game_def, :card_db]}

  schema "plugins" do

    field :author_user_id, :integer
    field :plugin_uuid, :string
    field :plugin_name, :string
    field :version, :integer
    field :game_def, :map
    field :card_db, :map
    field :num_favorites, :integer
    field :public, :boolean

    timestamps()
  end

  def changeset(plugin, params \\ %{}) do
    plugin
    |> cast(params, [:author_user_id, :plugin_uuid, :plugin_name, :version, :game_def, :card_db, :num_favorites, :public])
  end

  def list_plugins do
    query = from p in Plugin,
    join: u in User,
    on: [id: p.author_user_id],
    order_by: [desc: :version],
    where: [public: true],
    select: {
      p.author_user_id,
      u.alias,
      p.plugin_uuid,
      p.plugin_name,
      p.version,
      p.num_favorites,
      p.public,
      p.updated_at
    }
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

  def get_card_db_by_uuid_and_version(plugin_uuid, version) do
    plugin = get_by_uuid_and_version(plugin_uuid, version)
    plugin.card_db
  end

end
