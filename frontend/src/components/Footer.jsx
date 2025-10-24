const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-semibold text-white mb-3">Marketplace</h4>
          <p>Connecting buyers and sellers securely with escrow protection.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/support" className="hover:text-white">Support</a></li>
            <li><a href="/report" className="hover:text-white">Report Issue</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Contact</h4>
          <p>Email: support@marketplace.com</p>
          <p>Phone: +234 901 234 5678</p>
        </div>
      </div>
      <div className="text-center text-gray-500 mt-6 text-sm">
        © {new Date().getFullYear()} Marketplace Inc. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
