
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ShoppingCart, X, Trash2, ArrowRight, Loader2, Info, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

export const Cart: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, clearCart, isDarkMode, session } = useStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setError(null);

    if (!session) {
      onClose();
      navigate('/auth');
      return;
    }

    setIsCheckingOut(true);
    try {
      // Separiamo gli ID delle tracce da quelli degli album come richiesto dalla Edge Function
      const trackIds = cart
        .filter(item => item.type === 'track')
        .map(item => item.id)
        .join(',');
      
      const albumIds = cart
        .filter(item => item.type === 'album')
        .map(item => item.id)
        .join(',');

      // La licenza viene determinata dal primo elemento (o si assume uniforme per il checkout di gruppo)
      const licenseType = cart.length > 0 ? cart[0].licenseType : 'standard';

      const { data, error: invokeError } = await supabase.functions.invoke('ls-purchase-handler', {
        body: {
          track_ids: trackIds, // Stringa di ID separati da virgola
          album_ids: albumIds, // Stringa di ID separati da virgola
          user_id: session.user.id,
          license_type: licenseType,
          quantity: cart.length, // Somma totale di tutti gli elementi
          is_cart: true
        }
      });

      if (invokeError) throw invokeError;

      if (data?.checkout_url) {
        // Redirigi l'utente alla pagina di pagamento sicura di Lemon Squeezy
        window.location.href = data.checkout_url;
      } else {
        throw new Error("Failed to generate checkout link.");
      }
    } catch (err: any) {
      console.error("Checkout Error:", err);
      setError(err.message || "An error occurred during checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className={`
        relative w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300
        ${isDarkMode ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900'}
      `}>
        <div className="p-6 border-b border-zinc-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="text-sky-500" size={24} />
            <h2 className="text-xl font-black uppercase tracking-tight">Your Cart</h2>
            <span className="bg-sky-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {cart.length}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-500/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <ShoppingCart size={64} className="mb-4" />
              <p className="font-bold text-lg">Your cart is empty</p>
              <p className="text-sm">Start adding music to your collection.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div 
                  key={`${item.type}-${item.id}-${item.licenseType}`}
                  className={`p-3 rounded-2xl border flex items-center gap-4 group transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-zinc-200'}`}
                >
                  <img src={item.cover_url} alt={item.title} className="w-16 h-16 rounded-xl object-cover shadow-md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate text-sm">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${item.type === 'album' ? 'bg-indigo-500 text-white' : 'bg-zinc-500 text-white'}`}>
                        {item.type}
                      </span>
                      <p className="text-[10px] font-black uppercase tracking-widest text-sky-500">
                        {item.licenseType} License
                      </p>
                    </div>
                    <p className="text-sm font-bold mt-1">€{item.price.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id, item.licenseType)}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={clearCart}
                className="w-full text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-colors py-2"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className={`p-6 border-t ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-black uppercase tracking-widest opacity-60">Subtotal ({cart.length} items)</span>
              <span className="text-2xl font-black">€{totalPrice.toFixed(2)}</span>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {isCheckingOut ? <Loader2 size={24} className="animate-spin" /> : <ShoppingCart size={24} />}
              {isCheckingOut ? 'Generating Checkout...' : 'Checkout Now'}
              {!isCheckingOut && <ArrowRight size={20} />}
            </button>

            <div className="mt-4 flex items-start gap-2 opacity-40">
                <Info size={14} className="shrink-0 mt-0.5" />
                <p className="text-[10px] leading-tight font-medium">
                    Secure checkout by Lemon Squeezy. You will be redirected to the payment page. All licenses are perpetual.
                </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
