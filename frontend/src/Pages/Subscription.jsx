import { createOrder } from "../api/paymentApi";

function Subscription() {

  const handleUpgrade = async (plan) => {

    try {

      const data = await createOrder(plan);

      console.log(data);

    } catch (error) {

      console.log(error);

    }

  };

  return (
    <div className="min-h-screen p-10 bg-slate-100">

      <h1 className="text-4xl font-bold mb-10">
        Upgrade Plan 🚀
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        {/* FREE */}
        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-2xl font-bold">
            FREE
          </h2>

          <p className="mt-3">
            50 MB Storage
          </p>

        </div>

        {/* PRO */}
        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-2xl font-bold">
            PRO
          </h2>

          <p className="mt-3">
            5 GB Storage
          </p>

          <p className="font-bold mt-2">
            ₹99
          </p>

          <button
            onClick={() =>
              handleUpgrade("pro")
            }
            className="mt-5 bg-black text-white px-5 py-2 rounded"
          >
            Upgrade
          </button>

        </div>

        {/* BUSINESS */}
        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-2xl font-bold">
            BUSINESS
          </h2>

          <p className="mt-3">
            50 GB Storage
          </p>

          <p className="font-bold mt-2">
            ₹299
          </p>

          <button
            onClick={() =>
              handleUpgrade("business")
            }
            className="mt-5 bg-black text-white px-5 py-2 rounded"
          >
            Upgrade
          </button>

        </div>

      </div>

    </div>
  );
}

export default Subscription;