defmodule DragnCards.Repo.Migrations.ChangeEncounterNameToRoomTitle do
  use Ecto.Migration

  def up do
    alter table(:rooms) do
      remove(:encounter_name)
      add(:room_title, :string)
    end
  end

  def down do
    alter table(:rooms) do
      add(:encounter_name, :string)
      remove(:room_title, :string)
    end
  end
end
