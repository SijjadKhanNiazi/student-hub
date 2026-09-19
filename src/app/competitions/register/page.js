import RegisterForm from "@/app/competitions/components/RegisterForm";

export const metadata = {
  title: "Competition Registration",
  description: "Register to participate in the voting competition",
};

export default function CompetitionRegisterPage() {
  return (
    <section className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Join the Competition
      </h1>
      <RegisterForm />
    </section>
  );
}
