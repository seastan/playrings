defmodule DragnCards.Repo.Migrations.RoomAddPluginUuid do
  use Ecto.Migration

  def change do
    alter table(:rooms) do
      add(:plugin_uuid, :string)
    end
  end
end
