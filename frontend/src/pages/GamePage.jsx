import { useEffect, useMemo, useState } from "react"

const createTile = (id, left, right) => ({ id, left, right })

const initialHands = {
	A: [
		createTile("A-1", "Ácido", "H2SO4"),
		createTile("A-2", "Hidreto", "H2"),
		createTile("A-3", "Base", "NaOH"),
		createTile("A-4", "Ácido", "HCl"),
		createTile("A-5", "Sal", "NaCl"),
		createTile("A-6", "Óxido", "CO2"),
		createTile("A-7", "Base", "KOH"),
	],
	B: [
		createTile("B-1", "Ácido", "H2SO4"),
		createTile("B-2", "Hidreto", "H2"),
		createTile("B-3", "Base", "KOH"),
		createTile("B-4", "Sal", "NaCl"),
		createTile("B-5", "Óxido", "SO2"),
		createTile("B-6", "Ácido", "HNO3"),
		createTile("B-7", "Base", "NaOH"),
	],
	C: [
		createTile("C-1", "Ácido", "H2SO4"),
		createTile("C-2", "Sal", "NaCl"),
		createTile("C-3", "Base", "NaOH"),
		createTile("C-4", "Óxido", "CO2"),
		createTile("C-5", "Hidreto", "H2"),
		createTile("C-6", "Ácido", "HCl"),
		createTile("C-7", "Base", "KOH"),
	],
	D: [
		createTile("D-1", "Ácido", "HCl"),
		createTile("D-2", "Sal", "KCl"),
		createTile("D-3", "Base", "NaOH"),
		createTile("D-4", "Hidreto", "H2"),
		createTile("D-5", "Óxido", "SO2"),
		createTile("D-6", "Ácido", "HNO3"),
		createTile("D-7", "Base", "KOH"),
	],
}

const players = ["A", "B", "C", "D"]

export default function GamePage() {
	const [hands, setHands] = useState(initialHands)
	const [board, setBoard] = useState([
		createTile("start", "Ácido", "H2SO4"),
	])
	const [currentTurn, setCurrentTurn] = useState(0)
	const [message, setMessage] = useState(
		"Inicio de jogo com a pedra Ácido/Hidreto"
	)

	const boardEnds = useMemo(() => {
		if (board.length === 0) return { left: null, right: null }
		return { left: board[0].left, right: board[board.length - 1].right }
	}, [board])

	const isPlayable = (tile) => {
		if (!boardEnds.left && !boardEnds.right) return true
		return (
			tile.left === boardEnds.left ||
			tile.right === boardEnds.left ||
			tile.left === boardEnds.right ||
			tile.right === boardEnds.right
		)
	}

	const placeTile = (playerKey, tileId) => {
		const hand = hands[playerKey]
		const tile = hand.find((item) => item.id === tileId)
		if (!tile) return

		if (board.length === 0) {
			setBoard([tile])
		} else {
			const canRight = tile.left === boardEnds.right || tile.right === boardEnds.right
			const canLeft = tile.left === boardEnds.left || tile.right === boardEnds.left
			if (!canRight && !canLeft) return

			const placeOnRight = canRight
			const placedTile = placeOnRight
				? tile.left === boardEnds.right
					? { ...tile, left: tile.left, right: tile.right }
					: { ...tile, left: tile.right, right: tile.left }
				: tile.right === boardEnds.left
					? { ...tile, left: tile.left, right: tile.right }
					: { ...tile, left: tile.right, right: tile.left }

			setBoard((prev) =>
				placeOnRight ? [...prev, placedTile] : [placedTile, ...prev]
			)
		}

		setHands((prev) => ({
			...prev,
			[playerKey]: prev[playerKey].filter((item) => item.id !== tileId),
		}))
		setMessage(`${playerKey} jogou ${tile.left}/${tile.right}`)
		setCurrentTurn((prev) => (prev + 1) % players.length)
	}

	const handlePass = () => {
		setMessage(`Jogador ${players[currentTurn]} passou a vez`)
		setCurrentTurn((prev) => (prev + 1) % players.length)
	}

	useEffect(() => {
		const playerKey = players[currentTurn]
		if (playerKey === "A") return

		const timeout = setTimeout(() => {
			const hand = hands[playerKey]
			const playable = hand.find((tile) => isPlayable(tile))
			if (playable) {
				placeTile(playerKey, playable.id)
				return
			}
			setMessage(`Jogador ${playerKey} passou a vez`)
			setCurrentTurn((prev) => (prev + 1) % players.length)
		}, 650)

		return () => clearTimeout(timeout)
	}, [currentTurn, hands, boardEnds.left, boardEnds.right])

	return (
		<div className="relative w-screen h-screen bg-white overflow-hidden font-mono text-dq-red">
			{/* grid */}
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `
						linear-gradient(rgba(200,16,46,0.12) 1px, transparent 1px),
						linear-gradient(90deg, rgba(200,16,46,0.12) 1px, transparent 1px)
					`,
					backgroundSize: "36px 36px",
				}}
			/>

			{/* cantos */}
			<Corner pos="top-3 left-3" borders="border-t-2 border-l-2" />
			<Corner pos="top-3 right-3" borders="border-t-2 border-r-2" />
			<Corner pos="bottom-3 left-3" borders="border-b-2 border-l-2" />
			<Corner pos="bottom-3 right-3" borders="border-b-2 border-r-2" />

			{/* top bar */}
			<div className="absolute top-0 left-0 right-0 h-12 bg-dq-red text-white flex items-center px-4">
				<div className="flex-1 text-center font-bold tracking-[4px] text-[16px]">
					DOMINO QUIMICO
				</div>
				<button
					type="button"
					className="w-8 h-8 flex items-center justify-center rounded-full border border-white/60 text-white hover:bg-white/10"
					aria-label="Fechar"
				>
					✕
				</button>
			</div>

			{/* board */}
			<div className="relative z-10 w-full h-full flex items-center justify-center pt-12">
				<div className="relative w-[94%] h-[82%] bg-neutral-200 border border-black/10 rounded-sm">
					{/* top hand */}
					<div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-2">
						{hands.C.map((item) => (
							<HiddenTile key={item.id} orientation="vertical" />
						))}
					</div>
					<div className="absolute top-4 left-1/2 -translate-x-1/2 text-[14px] text-dq-text">
						Jogador C: <span className="text-dq-muted">{hands.C.length} Pedras</span>
					</div>

					{/* left hand */}
					<div className="absolute top-[54%] left-6 -translate-y-1/2 flex flex-col gap-2">
						{hands.B.map((item) => (
							<HiddenTile key={item.id} orientation="horizontal" />
						))}
					</div>
					<div className="absolute top-[12%] left-8 text-[14px] text-dq-text">
						Jogador B: <span className="text-dq-muted">{hands.B.length} Pedras</span>
					</div>

					{/* right hand */}
					<div className="absolute top-[54%] right-6 -translate-y-1/2 flex flex-col gap-2">
						{hands.D.map((item) => (
							<HiddenTile key={item.id} orientation="horizontal" />
						))}
					</div>
					<div className="absolute top-[12%] right-10 text-[14px] text-dq-text">
						Jogador D: <span className="text-dq-muted">{hands.D.length} Pedras</span>
					</div>

					{/* center info */}
					<div className="absolute inset-x-0 top-[38%] text-center text-[15px] text-dq-muted">
						{message}
					</div>

					{/* played tiles */}
					<div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
						{board.map((tile) => (
							<DominoTile
								key={tile.id}
								labelTop={tile.left}
								labelBottom={tile.right}
							/>
						))}
					</div>

					{/* bottom area */}
					<div className="absolute bottom-8 left-24">
						<div className="text-[15px] text-dq-text">Seu deck (Jogador A)</div>
						<button
							type="button"
							className="mt-2 bg-dq-red text-white text-[13px] px-6 py-2 rounded-full shadow-inner shadow-black/20 disabled:opacity-50"
							onClick={handlePass}
							disabled={players[currentTurn] !== "A"}
						>
							PASSAR VEZ
						</button>
					</div>

					<div className="absolute bottom-4 left-1/2 -translate-x-1/2">
						<div className="bg-neutral-300 rounded-[20px] px-4 py-3 flex items-center gap-2">
							{hands.A.map((item) => (
								<DominoTile
									key={item.id}
									labelTop={item.left}
									labelBottom={item.right}
									onClick={() =>
										players[currentTurn] === "A" &&
										isPlayable(item) &&
										placeTile("A", item.id)
									}
									isDisabled={
										players[currentTurn] !== "A" || !isPlayable(item)
									}
								/>
							))}
						</div>
					</div>

					<div className="absolute bottom-8 right-10 text-[16px]">
						Vez: <span className="text-dq-text">Jogador {players[currentTurn]}</span>
					</div>
				</div>
			</div>
		</div>
	)
}

function Corner({ pos, borders }) {
	return <div className={`absolute w-5 h-5 ${pos} ${borders} border-dq-red`} />
}

function HiddenTile({ orientation = "vertical" }) {
	const base =
		"bg-white border border-black/50 rounded-[6px] shadow-[0_1px_0_rgba(0,0,0,0.15)]"
	const tileClass =
		orientation === "vertical" ? "w-[42px] h-[64px]" : "w-[64px] h-[42px]"
	return (
		<div className={`${base} ${tileClass}`} />
	)
}

function DominoTile({
	labelTop,
	labelBottom,
	orientation = "horizontal",
	onClick,
	isDisabled,
}) {
	const isVertical = orientation === "vertical"
	const base =
		"bg-white border border-black/50 rounded-[6px] shadow-[0_1px_0_rgba(0,0,0,0.15)] text-dq-text"
	return (
		<div
			className={`${base} ${
				isVertical ? "w-[48px] h-[54px]" : "w-[60px] h-[34px]"
			} flex ${isVertical ? "flex-col" : "flex-row"} ${
				isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
			}`}
			onClick={onClick}
		>
			<div
				className={`flex-1 flex items-center justify-center text-[9px] ${
					isVertical ? "border-b border-black/20" : "border-r border-black/20"
				}`}
			>
				{labelTop}
			</div>
			<div className="flex-1 flex items-center justify-center text-[9px]">
				{labelBottom}
			</div>
		</div>
	)
}
