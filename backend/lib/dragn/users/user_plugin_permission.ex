defmodule DragnCards.UserPluginPermission do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:user_id, :private_access]}

  schema "user_plugin_permission" do
    belongs_to :user, DragnCards.Users.User, foreign_key: :user_id
    belongs_to :plugin, DragnCards.Plugins.Plugin, foreign_key: :private_access

    timestamps()
  end

  @doc false
  def changeset(user_plugin_permission, attrs) do
    user_plugin_permission
    |> cast(attrs, [:user_id, :private_access])
    |> validate_required([:user_id, :private_access])
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:private_access)
  end
end
