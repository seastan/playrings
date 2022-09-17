defmodule DragnCards.Repo.Migrations.ChangeEncounterNameToRoomTitle do
  use Ecto.Migration

  def change do
    alter table(:rooms) do
      remove(:encounter_name)
      add(:room_title, :string)
    end
  end
end
