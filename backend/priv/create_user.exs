defmodule CreateDevUser do
  def run do
    alias DragnCards.Users.User
    alias DragnCards.Repo

    user_attrs = %{
      alias: "dev_user",
      email: "dev_user@example.com",
      password: "password",
      password_confirmation: "password",
      supporter_level: 1,
      language: "English",
      plugin_settings: %{}
    }

    changeset = User.changeset(%User{}, user_attrs)

    case Repo.insert(changeset) do
      {:ok, user} ->
        IO.puts("User created successfully!")
        IO.inspect(user)
      {:error, changeset} ->
        IO.puts("Failed to create user:")
        IO.inspect(changeset.errors)
    end
  end
end


CreateDevUser.run()
