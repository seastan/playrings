defmodule DragnCards.Rooms.Room do
  @moduledoc """
  Represents a room where people join and play a game.
  """
  use Ecto.Schema
  import Ecto.Changeset
  alias DragnCardsUtil.Slugify

  # Automatically convert to JSON when broadcasting %Room{}
  # Objects over channel messages
  @derive {Jason.Encoder, only: [:id, :name, :slug, :created_by, :privacy_type, :last_update, :num_players, :plugin_id]}

  schema "rooms" do
    field :name, :string
    field :slug, :string
    field :created_by, :integer
    field :privacy_type, :string
    field :last_update, :integer
    field :num_players, :integer
    field :plugin_id, :string

    timestamps()
  end

  @doc false
  def changeset(room, attrs) do
    room
    |> cast(attrs, [:name, :created_by, :privacy_type, :last_update, :num_players, :plugin_id])
    |> validate_required([:name, :created_by, :privacy_type, :last_update, :num_players, :plugin_id])
    |> put_slug()
  end

  def put_slug(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{name: name}} ->
        put_change(changeset, :slug, Slugify.slugify(name))

      _ ->
        changeset
    end
  end
end
