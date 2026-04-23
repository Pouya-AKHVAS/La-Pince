import RegisterForm from '../../components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <main>
      <h1>Créer un compte</h1>
      <RegisterForm />
      <p>
        Déjà un compte ? <a href="/login">Se connecter</a>
      </p>
    </main>
  )
}