defmodule DragnCards.Repo.Migrations.UserAddLanguage do
  use Ecto.Migration

  def change do
    alter table("users") do
      add(:language, :string)
    end
  end
end
