defmodule DragnCards.Repo.Migrations.UserAddTooltips do
  use Ecto.Migration

  def change do
    alter table("users") do
      add(:hidden_tooltips, {:array, :string})
    end
  end
end
