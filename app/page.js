"use client";
import { useState, useEffect, useRef } from "react";
import { auth, provider, db } from "../lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, onSnapshot, updateDoc, doc, deleteDoc, orderBy } from "firebase/firestore";
import ISBNScanner from "../components/ISBNScanner";

export default function Home() {
  const [user, setUser] = useState(null);
  const [bookInfo, setBookInfo] = useState(null);
  const [books, setBooks] = useState([]);
  const [showScanner, setShowScanner] = useState(true);
  
  const isbnInputRef = useRef(null);

  // ログイン状態の監視
  useEffect(() => {
    if (typeof window === "undefined") return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        subscribeToBooks(currentUser.uid);
      } else {
        setBooks([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const subscribeToBooks = (uid) => {
    const q = query(
        collection(db, "users", uid, "books"),
        orderBy("createdAt", "desc")
    );
    onSnapshot(q, (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      alert("ログイン設定エラー: FirebaseコンソールでGoogleログインを有効にしてください。");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const fetchBookInfo = async (isbn) => {
    const cleanIsbn = isbn.replace(/-/g, "").trim();

    if (cleanIsbn.length !== 13 && cleanIsbn.length !== 10) {
        alert("ISBNは10桁または13桁で入力してください");
        return;
    }

    setShowScanner(false);
    
    try {
      const res = await fetch(`https://api.openbd.jp/v1/get?isbn=${cleanIsbn}`);
      const data = await res.json();
      if (data && data[0]) {
        const info = data[0].summary;
        setBookInfo({
          isbn: info.isbn,
          title: info.title,
          cover: info.cover || "",
          author: info.author,
          publisher: info.publisher
        });
        
        if (isbnInputRef.current) {
            isbnInputRef.current.value = "";
        }
      } else {
        alert("書籍情報が見つかりませんでした。");
        setShowScanner(true);
      }
    } catch (error) {
      console.error("API Error", error);
      alert("通信エラーが発生しました");
      setShowScanner(true);
    }
  };

  const handleManualSearch = () => {
      const inputValue = isbnInputRef.current?.value;
      if (!inputValue) return;
      fetchBookInfo(inputValue);
  };

  const addToWishList = async () => {
    if (!user || !bookInfo) return;
    try {
      await addDoc(collection(db, "users", user.uid, "books"), {
        ...bookInfo,
        status: "wish",
        createdAt: new Date()
      });
      setBookInfo(null);
      setShowScanner(true);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const cancelAdd = () => {
      setBookInfo(null);
      setShowScanner(true);
  };

  const moveToOwned = async (docId) => {
    const bookRef = doc(db, "users", user.uid, "books", docId);
    await updateDoc(bookRef, { status: "owned" });
  };

  const deleteBook = async (docId) => {
    if(!confirm("削除しますか？")) return;
    await deleteDoc(doc(db, "users", user.uid, "books", docId));
  };

  // --- 画面表示 ---

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">My Book Manager</h1>
        <button onClick={handleLogin} className="bg-blue-600 text-white px-8 py-4 rounded-lg shadow-lg hover:bg-blue-700 transition font-bold">
          Googleアカウントでログイン
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-20 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">My Book Manager</h1>
        <div className="flex items-center gap-3">
           {user.photoURL && <img src={user.photoURL} alt="user" className="w-8 h-8 rounded-full" />}
           <button onClick={handleLogout} className="text-sm text-red-500 hover:bg-red-50 px-2 py-1 rounded">ログアウト</button>
        </div>
      </header>

      {/* 1. スキャナー & 手動入力セクション */}
      <section className="mb-8">
        {showScanner && !bookInfo && (
            <div className="flex flex-col gap-6">
                <ISBNScanner onDetected={fetchBookInfo} />

                <div className="w-full max-w-md mx-auto bg-white p-4 rounded shadow">
                    <p className="text-center text-sm text-gray-500 mb-2">- または ISBNを手入力 -</p>
                    <div className="flex gap-2">
                        {/* ▼▼▼ 変更点：数字入力モードを追加 ▼▼▼ */}
                        <input 
                            type="text"
                            inputMode="numeric" // スマホで数字キーパッドを出す
                            pattern="[0-9]*"    // iOS用の補助設定
                            placeholder="例: 9784..." 
                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-gray-800"
                            ref={isbnInputRef} 
                        />
                        <button 
                            onClick={handleManualSearch}
                            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            検索
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* 確認カード */}
        {bookInfo && (
            <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-blue-500 max-w-md mx-auto animate-fade-in">
                <h3 className="font-bold text-xl text-gray-800 mb-1">{bookInfo.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{bookInfo.author} / {bookInfo.publisher}</p>
                
                <div className="flex justify-center mb-4 bg-gray-100 p-2 rounded">
                    {bookInfo.cover ? (
                        <img src={bookInfo.cover} alt="cover" className="h-40 object-contain shadow-md" />
                    ) : (
                        <div className="h-40 w-28 bg-gray-300 flex items-center justify-center text-gray-500">No Image</div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button onClick={addToWishList} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-bold transition">
                        「買いたい」に追加
                    </button>
                    <button onClick={cancelAdd} className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 font-bold transition">
                        キャンセル
                    </button>
                </div>
            </div>
        )}
      </section>

      {/* 2. リスト表示セクション */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-blue-600 flex items-center gap-2">
                <span>📖</span> 買いたいリスト
            </h2>
            <div className="space-y-3">
                {books.filter(b => b.status === 'wish').map(book => (
                    <BookCard key={book.id} book={book} onMove={() => moveToOwned(book.id)} onDelete={() => deleteBook(book.id)} isWish={true} />
                ))}
                {books.filter(b => b.status === 'wish').length === 0 && <p className="text-gray-400 text-center py-4">まだありません</p>}
            </div>
        </div>

        <div className="bg-white p-4 rounded shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-green-600 flex items-center gap-2">
                <span>📚</span> 蔵書リスト
            </h2>
            <div className="space-y-3">
                {books.filter(b => b.status === 'owned').map(book => (
                    <BookCard key={book.id} book={book} onDelete={() => deleteBook(book.id)} isWish={false} />
                ))}
                {books.filter(b => b.status === 'owned').length === 0 && <p className="text-gray-400 text-center py-4">まだありません</p>}
            </div>
        </div>
      </div>
    </main>
  );
}

function BookCard({ book, onMove, onDelete, isWish }) {
    return (
        <div className="bg-gray-50 p-3 rounded border border-gray-100 flex gap-3 items-start hover:shadow-md transition">
            {book.cover ? (
                <img src={book.cover} alt="cover" className="w-14 h-20 object-cover rounded shadow-sm flex-shrink-0" />
            ) : (
                <div className="w-14 h-20 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-[10px] text-gray-500">No Img</div>
            )}
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-sm truncate">{book.title}</h3>
                <p className="text-xs text-gray-500 mb-2 truncate">{book.author}</p>
                <div className="flex gap-2 justify-end mt-1">
                    {isWish && (
                        <button onClick={onMove} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition">
                            購入済
                        </button>
                    )}
                    <button onClick={onDelete} className="text-xs bg-red-100 text-red-500 px-2 py-1 rounded hover:bg-red-200 transition">
                        削除
                    </button>
                </div>
            </div>
        </div>
    )
}