defmodule DragnCards.Repo.Migrations.RoomAddQuestDetails do
  use Ecto.Migration

  def change do
    alter table(:rooms) do
      add(:encounter_name, :string)
      add(:num_players, :integer)
    end
  end
end
