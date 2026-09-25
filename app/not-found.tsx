import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap">
      <Link href="/" className="trip-back">
        ← Все поездки
      </Link>
      <div className="trip-hero">
        <h1 className="trip-hero__title">Не туда свернули</h1>
        <p className="trip-hero__subtitle">
          Такой страницы нет — видимо, навигатор снова повёл по грунтовке. Вернитесь к списку
          поездок и попробуйте ещё раз.
        </p>
      </div>
    </div>
  );
}
