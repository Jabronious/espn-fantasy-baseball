export enum HittingStats {
	AB = <number>0,
	RBI = <number>21,
	GIDP = <number>26,
	BTW = <number>74,
	H = <number>1,
	DPT = <number>73,
	CYC = <number>30,
	'3B' = <number>4,
	CS = <number>24,
	SBN = <number>25,
	BTL = <number>75,
	'2B' = <number>3,
	XBH = <number>6,
	K = <number>27,
	FC = <number>67,
	TB = <number>8,
	HR = <number>5,
	AST = <number>69,
	BB = <number>10,
	IBB = <number>11,
	'1B' = <number>7,
	PO = <number>68,
	SAC = <number>15,
	E = <number>72,
	GWRBI = <number>22,
	GSHR = <number>31,
	R = <number>20,
	HBP = <number>12,
	OFAST = <number>70,
	SB = <number>23,
	OBP = <number>17,
}

export enum PitchingStats {
	PTW = <number>76,
	GS = <number>33,
	HD = <number>60,
	QS = <number>63,
	SV = <number>57,
	BB = <number>39,
	SO = <number>64,
	PC = <number>36,
	G = <number>32,
	SVHD = <number>83,
	K = <number>48,
	BS = <number>58,
	CG = <number>62,
	BF = <number>35,
	HR = <number>46,
	PTL = <number>77,
	B = <number>51,
	NH = <number>65,
	W = <number>53,
	RA = <number>234,
	WP = <number>50,
	PG = <number>66,
	PKO = <number>52,
	L = <number>54,
	ER = <number>45,
	HB = <number>42,
	IP = <number>34,
	H = <number>37,
	SOP = <number>56,
	WHIP = <number>41,
	ERA = <number>47,
}

export type Stats = typeof HittingStats & typeof PitchingStats;
