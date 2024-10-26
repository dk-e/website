export default function Donate() {
  return (
    <>
      <h2 className="mb-2 mt-4 text-xl font-medium">donation addresses</h2>
      <p className="prose prose-neutral dark:prose-invert mb-8">
        feel free to donate to support me!
      </p>
      <ul className="space-y-4">
        <li>
          <span className="text-lg">bitcoin (BTC)</span>
          <br />
          <p className="prose prose-neutral dark:prose-invert mb-4">
            bc1qaqy0gme8keykhfx924hsqrc77lvr6fndsa5pyh
          </p>
        </li>
        <li>
          <span className="text-lg">ethereum (ERC20)</span>
          <br />
          <p className="prose prose-neutral dark:prose-invert mb-4">
            0xE285C41E39Cdc7579e1C366342a41B9e29f9B3D4
          </p>
        </li>
        <li>
          <span className="text-lg">monero (XMR)</span>
          <br />
          <p className="prose prose-neutral dark:prose-invert mb-4">
            44DL9e1urrvZnFyvdNb8DE8JMuDX8WYA6dXvuNcguNKv2JPZH6T72WK8XDYn5cimTHgrnAACJfB7aFHNB4GohbRT59Kw7gk
          </p>
        </li>
        <li>
          <span className="text-lg">litecoin (LTC)</span>
          <br />
          <p className="prose prose-neutral dark:prose-invert mb-4">
            LYSFCXb72fBhfGM21FGMc5awqM2pfrVcbW
          </p>
        </li>
      </ul>
    </>
  );
}
